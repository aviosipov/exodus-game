import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client (ensure OPENAI_API_KEY is set in your environment)
const openai = new OpenAI();

interface DocInfo {
  filename: string;
  title: string | null;
  description: string | null;
}

interface RequestBody {
  query: string;
  documents: DocInfo[];
}

// Define the function schema for OpenAI function calling
const findRelevantDocFunction = {
  name: 'find_relevant_document',
  description: 'Determines the most relevant document filename based on a user query and a list of document metadata.',
  parameters: {
    type: 'object',
    properties: {
      filename: {
        type: ['string', 'null'], // Allow string or null
        description: 'The filename of the most relevant document (e.g., "getting-started.mdx"), or null if no relevant document is found.',
      },
    },
    required: ['filename'],
  },
};

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { query, documents } = body;

    if (!query || !Array.isArray(documents)) {
      return NextResponse.json({ error: 'Missing or invalid query or documents in request body.' }, { status: 400 });
    }

    // Prepare the document list context for the prompt
    const documentContext = documents
      .map(doc => `- Filename: ${doc.filename}\n  Title: ${doc.title || 'N/A'}\n  Description: ${doc.description || 'N/A'}`)
      .join('\n\n');

    const systemPrompt = `You are an AI assistant helping users find relevant documentation. Based on the user's query and the provided list of documents (with filenames, titles, and descriptions), identify the single most relevant document. Only consider title and description for relevance. If no document seems sufficiently relevant, indicate that. Use the 'find_relevant_document' function to return your answer.`;

    const userPrompt = `User Query: "${query}"

Available Documents:
${documentContext}

Which document is most relevant to the user query?`;

    // Call OpenAI API with function calling
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Use consistent model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      tools: [{ type: 'function', function: findRelevantDocFunction }],
      tool_choice: { type: 'function', function: { name: findRelevantDocFunction.name } }, // Force the function call
    });

    const message = response.choices[0]?.message;

    if (message?.tool_calls && message.tool_calls[0]?.function?.arguments) {
      const functionArgs = JSON.parse(message.tool_calls[0].function.arguments);
      // Validate the response structure (optional but recommended)
      if (typeof functionArgs.filename !== 'undefined') {
         // Ensure filename is either a string or null
         const filename = typeof functionArgs.filename === 'string' ? functionArgs.filename : null;
         return NextResponse.json({ filename });
      } else {
         console.error('OpenAI function call did not return the expected filename argument.');
         return NextResponse.json({ filename: null }); // Default to null if structure is wrong
      }
    } else {
      console.error('OpenAI response did not include the expected function call or arguments.');
      // Fallback or error handling - perhaps return null if no function call occurred
      return NextResponse.json({ filename: null });
    }

  } catch (error) {
    console.error('Error in /api/docs/find-relevant:', error);
    let errorMessage = 'Failed to find relevant document.';
    let statusCode = 500;

    if (error instanceof SyntaxError) {
        errorMessage = 'Invalid JSON in request body.';
        statusCode = 400;
    } else if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI API error: ${error.message}`;
        statusCode = error.status || 500;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
