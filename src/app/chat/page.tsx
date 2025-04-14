"use client";

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
// Removed: import { useChat } from 'ai/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";
import { Character, availableCharacters } from '@/lib/characters'; // Import shared character data

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
  const [currentCharacter, setCurrentCharacter] = useState<Character>(availableCharacters[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to potentially clear chat when character changes (optional)
  useEffect(() => {
    // setMessages([]); // Uncomment to clear messages when character changes
    // setInput("");
    // setError(null);
  }, [currentCharacter]);

  // --- Input Change Handler ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // --- Helper to get the last assistant response ID ---
  const getLastAssistantResponseId = (): string | null => {
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    return lastAssistantMessage?.response_id || null;
  };

  // --- Form Submission Handler (Manual Fetch) ---
  const handleFormSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault(); // Prevent default form submission if event exists
    if (!input.trim() || isLoading) return; // Don't submit if empty or loading

    const userInput = input;
    const newUserMessage: Message = { id: generateId(), role: 'user', content: userInput };

    // Optimistically add user message
    setMessages(prev => [...prev, newUserMessage]);
    setInput(""); // Clear input field
    setIsLoading(true);
    setError(null);

    const lastAssistantId = getLastAssistantResponseId();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage], // Send current history including new user message
          body: { // Nest characterId and previous_response_id inside 'body' as expected by backend
            characterId: currentCharacter.id,
            previous_response_id: lastAssistantId,
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
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center justify-between"
      style={{ backgroundImage: `url('${BACKGROUND_IMG}')` }}
    >
      {/* Right Side Wrapper (Chat + Selection) */}
      <div className="w-1/3 h-[90vh] flex flex-col items-center m-8">
        {/* Character Selection UI */}
        <div className="flex space-x-2 space-x-reverse mb-4">
          {availableCharacters.map((char) => (
            <Avatar
              key={char.name}
              className={`h-16 w-16 cursor-pointer border-2 ${currentCharacter.name === char.name ? 'border-blue-500' : 'border-transparent'} hover:border-blue-300`}
              onClick={() => setCurrentCharacter(char)}
              title={char.name}
            >
              <AvatarImage src={char.imagePath} alt={char.name} />
              <AvatarFallback>{char.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
        </div>

        {/* Chat UI Container */}
        <Container
          variant="default"
          className="w-full h-full flex flex-col shadow-lg !p-0"
        >
          {/* Chat Header */}
          <div className="p-4 flex items-center justify-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={currentCharacter.imagePath} alt={currentCharacter.name} />
              <AvatarFallback>{currentCharacter.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-right">
              <Typography variant="h3">{currentCharacter.name}</Typography>
              <Typography variant="body1">{currentCharacter.description}</Typography>
            </div>
          </div>

          {/* Message Display Area */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
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
            {/* Display Error */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-[70%] p-3 rounded-lg bg-red-600 text-white text-center">
                  Error: {error}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
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

      {/* Left Side: Character Display */}
      <div className="w-2/3 h-full flex items-end justify-center p-10 relative">
         <div
            key={currentCharacter.name}
            className={`character h-[80%] w-full bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out opacity-100`}
            style={{ backgroundImage: `url('${currentCharacter.imagePath}')` }}
         ></div>
      </div>
    </div>
  );
}
