"use client";

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { Trash2 } from 'lucide-react'; // Import Trash2 icon
// Removed: import { useChat } from 'ai/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

// Define Character structure - This should ideally match the structure in info.json
// We might need to fetch this definition or ensure consistency manually.
interface Character {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  thumbPath: string;
  openingLines?: string[];
}

// Define message structure
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response_id?: string; // Store the response ID from the assistant message
}

// Simple ID generator
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Default background remains the same
const BACKGROUND_IMG = "/images/ancient_egypt_prosperity_bg.webp";

export default function ChatPage() {
  // --- State Management ---
  const [allCharacters, setAllCharacters] = useState<Character[]>([]); // State to hold loaded characters
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null); // Start with null initially
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Removed unused previousOpeningLineIndex state

  // --- Effects ---
  // Effect to load characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      // Define the known character IDs (folder names)
      // In a real app, this might come from an API endpoint that lists directories
      const characterIds = ["moses", "elisheva", "pharaoh", "ahmos", "issachar", "osiris", "ohad"];
      try {
        const characterPromises = characterIds.map(id =>
          fetch(`/characters/${id}/info.json`).then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch info for ${id}: ${res.statusText}`);
            }
            return res.json();
          })
        );
        const charactersData = await Promise.all(characterPromises);
        setAllCharacters(charactersData);
        // Set the first character as the default current character
        if (charactersData.length > 0) {
          setCurrentCharacter(charactersData[0]);
        }
      } catch (error) {
        console.error("Failed to load characters:", error);
        setError("Failed to load character data."); // Set error state
      }
    };

    fetchCharacters();
  }, []); // Empty dependency array ensures this runs only once on mount


  // Effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Removed useEffect that automatically added initial assistant message.
  // Conversation starters will be handled differently below.

  // --- Input Change Handler ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // --- Helper to get the last assistant response ID ---
  const getLastAssistantResponseId = (): string | null => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    return lastAssistantMessage?.response_id || null;
  };

  // --- Send Message Function (used by both form submit and starter click) ---
  const sendMessage = async (messageContent: string, currentMessages: Message[]) => {
    if (!messageContent.trim() || isLoading || !currentCharacter) return; // Added check for currentCharacter

    const newUserMessage: Message = { id: generateId(), role: 'user', content: messageContent };

    // Use functional update to ensure we have the latest messages state
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setError(null);

    // Get last assistant ID based on the state *before* adding the new user message
    const lastAssistantId = getLastAssistantResponseId(); // This needs to use the state *before* the update

    // Prepare the message history to send to the API *including* the new user message
    const messagesToSend = [...currentMessages, newUserMessage];

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesToSend, // Send the updated history
          body: {
            characterId: currentCharacter.id, // No need for null check here due to guard clause above
            previous_response_id: lastAssistantId, // Send the ID from *before* the user message was added
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.role === 'assistant' && data.content) {
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.content,
          response_id: data.response_id // Store the response ID for the next turn
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error("Invalid response format from server.");
      }

    } catch (err) { // Removed ': any'
      console.error("Chat error:", err);
      // Type check the error before accessing properties
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      // Optionally remove the optimistic user message on error
      // setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };


  // --- Form Submission Handler (Manual Fetch) ---
  const handleFormSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, messages); // Pass current messages state
    setInput(""); // Clear input after sending
  };

  // --- Conversation Starter Click Handler ---
  const handleStarterClick = (starterText: string) => {
    sendMessage(starterText, messages); // Pass current messages state
  };


  // --- Clear Chat Handler ---
  const handleClearChat = () => {
    setMessages([]); // Clear messages
    setError(null); // Also clear any existing errors
    // Removed previousOpeningLineIndex reset
  };

  // --- Input Key Press Handler ---
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent newline in input
      handleFormSubmit(); // Call the manual submit handler
    }
  };

  return (
    <div
      dir="rtl" // Right-to-left for Hebrew
      // Changed flex direction for mobile, normal row order on md+, adjusted justification
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center md:justify-between" // Removed md:flex-row-reverse
      style={{ backgroundImage: `url('${BACKGROUND_IMG}')` }}
    >
      {/* Right Side Wrapper (Chat + Selection) - Takes full width on mobile, 1/3 on md+. Added top padding for mobile (pt-16) */}
      {/* This is now the RIGHT side on desktop */}
      <div className="w-full md:w-1/3 h-full md:h-[90vh] flex flex-col items-center pt-16 p-4 md:pt-4 md:m-8"> {/* Added pt-16 for mobile, kept p-4/md:pt-4 for others */}
        {/* Character Selection UI */}
        <div className="flex space-x-2 space-x-reverse mb-4 min-h-[72px]"> {/* Added min-height */}
          {allCharacters.length === 0 && !error && <p className="text-white">Loading characters...</p>} {/* Loading indicator */}
          {allCharacters.map((char: Character) => ( // Use allCharacters and add type
            <Avatar
              key={char.id}
              className={`h-16 w-16 cursor-pointer border-2 ${currentCharacter?.id === char.id ? 'border-blue-500' : 'border-transparent'} hover:border-blue-300`} // Added null check
              onClick={() => setCurrentCharacter(char)}
              title={char.name}
            >
              <AvatarImage src={char.thumbPath} alt={char.name} />
              <AvatarFallback>{char.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Chat UI Container */}
        <Container
          variant="default"
          // Ensure full height within its flex container, handle overflow
          className="w-full h-full flex flex-col shadow-lg !p-0 overflow-hidden"
        >
          {/* Chat Header */}
          {/* Conditional rendering for Chat Header based on currentCharacter */}
          {currentCharacter && (
            <div className="p-4 flex items-center justify-start gap-3 border-b border-gray-700">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentCharacter.thumbPath} alt={currentCharacter.name} />
                <AvatarFallback>{currentCharacter.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <Typography variant="h3">{currentCharacter.name}</Typography>
                <Typography variant="body1">{currentCharacter.description}</Typography>
              </div >
              {/* Clear Chat Button */}
              < button
              onClick={handleClearChat}
              className="ml-auto p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
              title="Clear Chat"
              disabled={messages.length === 0 || isLoading} // Disable if no messages or loading
              >
                < Trash2 size={20} />
              </button >
            </div >
          )}
          {/* End Conditional Chat Header */}

          {/* Message Display Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 flex flex-col justify-center"> {/* Added flex flex-col justify-center */}
            {/* Show Starters only if messages are empty */}
            {messages.length === 0 && currentCharacter && currentCharacter.openingLines && (
              <div className="flex flex-col items-center gap-4 my-auto"> {/* Increased gap to 4 */}
                {currentCharacter.openingLines.map((line, index) => (
                  <button
                    key={index}
                    onClick={() => handleStarterClick(line)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 disabled:opacity-50 transition-colors duration-150 ease-in-out"
                  >
                    {line}
                  </button>
                ))}
              </div>
            )}

            {/* Regular Message Mapping */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-end">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-600 text-white animate-pulse">
                  ...
                </div>
              </div>
            )}
            {/* Display Error */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-[70%] p-3 rounded-lg bg-red-600 text-white text-center">
                  Error: {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} /> {/* This helps scroll to bottom */}
          </div>

          {/* Input Area - Hide if showing starters? Optional, keeping it visible for now */}
          <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-600 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="כתוב את שאלתך כאן..."
              className="flex-grow p-2 rounded border border-gray-500 bg-gray-700 text-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={isLoading || input.trim() === ''}
            >
              {isLoading ? 'שולח...' : 'שלח'}
            </button>
          </form>
        </Container>
      </div>

      {/* Left Side: Character Display - Hidden on mobile, takes 2/3 width on md+ */}
      {/* This is now the LEFT side on desktop */}
      {/* Conditional rendering for Character Display based on currentCharacter */}
      {currentCharacter && (
        <div className="hidden md:flex w-full md:w-2/3 h-full items-end justify-center p-10 relative"> {/* Centered character */}
          <div
              key={currentCharacter.id} // Use id for key
              // Increased height slightly, ensure it scales within container
              className={`character h-[85%] w-full bg-contain bg-no-repeat bg-center transition-opacity duration-500 ease-in-out opacity-100`}
              style={{ backgroundImage: `url('${currentCharacter.imagePath}')` }}
          ></div>
        </div>
      )}
      {/* End Conditional Character Display */}
    </div>
  );
}
