import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
// Removed Vercel AI SDK imports
import { getCharacterById } from '@/lib/characters';

// Initialize OpenAI client using environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Removed edge runtime export as fs module is used in characters.ts
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Extract messages, characterId, previous_response_id, and initial_context from the request body
    const { messages, body } = await req.json();
    const characterId = body?.characterId;
    const previous_response_id = body?.previous_response_id; // Get the previous response ID
    const initial_context = body?.initial_context; // Get the initial context (MDX content)

    // --- 1. Get Character Info & Vector Store ID ---
    const character = getCharacterById(characterId);
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

    // Basic validation
    if (!character) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    if (!vectorStoreId) {
      console.error('OPENAI_VECTOR_STORE_ID is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: Vector Store ID missing' }, { status: 500 });
    }
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables.');
      return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
    }

    // --- 2. Prepare the conversation history ---
    // Find the last user message content
    const lastUserMessageContent = messages.filter((m: { role: string }) => m.role === 'user').pop()?.content;
    if (!lastUserMessageContent) {
      return NextResponse.json({ error: 'No user message content found' }, { status: 400 });
    }

    // --- 3. Call the Responses API with Streaming ---
    try {
      // Prepare the system prompt, potentially prepending the initial context
      let systemPrompt = character.systemPrompt;
      if (initial_context) {
        systemPrompt = `Here is the content of the document we are discussing:\n\n${initial_context}\n\n---\n\n${character.systemPrompt}`;
      }

      // Create request parameters
      const requestParams: OpenAI.Responses.ResponseCreateParams = {
        model: "gpt-4.1-mini", // Or your preferred model
        input: lastUserMessageContent, // The current user message content
        instructions: systemPrompt, // Use the potentially modified system prompt
        tools: [{
          type: "file_search",
          vector_store_ids: [vectorStoreId] // Link to your vector store
        }],
        // stream: false, // Ensure streaming is disabled (default is false)
        previous_response_id: previous_response_id || null, // Pass the previous response ID if available
        truncation: 'auto' // Automatically handle context window limits
      };

      const response = await openai.responses.create(requestParams);

      // --- 4. Extract text from the non-streamed response ---
      // Attempt to find the text content within the response structure.
      // The exact path might depend on the specific response format.
      // This looks for the first 'output_text' type within the first 'message' type output.
      let responseText = "Sorry, I couldn't generate a response."; // Default message
      const messageOutput = response.output?.find(item => item.type === 'message');
      if (messageOutput?.type === 'message') {
          const textContent = messageOutput.content?.find(contentItem => contentItem.type === 'output_text');
          if (textContent?.type === 'output_text') {
              responseText = textContent.text;
          }
      }
      // Fallback or alternative extraction if the above path fails:
      // You might need to inspect the 'response' object structure if the above doesn't work.
      // console.log("Full Response:", JSON.stringify(response, null, 2));

      // Return the extracted text in the expected format for the frontend hook
      return NextResponse.json({
        role: 'assistant',
        content: responseText,
        // Optionally include the response ID for the next turn
        response_id: response.id
      });

    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);
      return NextResponse.json({
        error: 'OpenAI API Error',
        details: apiError instanceof Error ? apiError.message : 'Unknown API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Error in /api/chat POST handler:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to process chat message', details: errorMessage }, { status: 500 });
  }
}
