"use client";

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

// Define Character structure (ensure consistency with info.json)
export interface Character {
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

interface ChatInterfaceProps {
    character: Character | null; // The character to chat with
    initialMessages?: Message[]; // Optional initial messages
    showStarters?: boolean; // Whether to show opening lines if messages are empty
    className?: string; // Allow passing additional classes
    onMessagesUpdate?: (messages: Message[]) => void; // Callback when messages change
    height?: string; // Allow custom height
    dir?: 'ltr' | 'rtl'; // Add dir prop
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    character,
    initialMessages = [],
    showStarters = true,
    className = "",
    onMessagesUpdate,
    height = "h-full", // Default to full height
    dir = 'ltr' // Default to 'ltr' if not provided
}) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Effect to scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Effect to update parent component when messages change
    useEffect(() => {
        if (onMessagesUpdate) {
            onMessagesUpdate(messages);
        }
    }, [messages, onMessagesUpdate]);

    // --- Input Change Handler ---
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    // --- Helper to get the last assistant response ID ---
    const getLastAssistantResponseId = (): string | null => {
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
        return lastAssistantMessage?.response_id || null;
    };

    // --- Send Message Function ---
    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading || !character) return;

        const newUserMessage: Message = { id: generateId(), role: 'user', content: messageContent };

        // Use functional update for messages
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);

        const lastAssistantId = getLastAssistantResponseId(); // Get ID *before* adding new user message

        // Prepare history *including* the new user message
        const messagesToSend = [...messages, newUserMessage]; // Use current state + new message

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messagesToSend,
                    body: {
                        characterId: character.id,
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
                    response_id: data.response_id
                };
                setMessages(prev => [...prev, assistantMessage]);
            } else {
                throw new Error("Invalid response format from server.");
            }

        } catch (err) {
            console.error("Chat error:", err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
            // Optional: Remove optimistic user message on error
            // setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
        } finally {
            setIsLoading(false);
        }
    };

    // --- Form Submission Handler ---
    const handleFormSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    // --- Conversation Starter Click Handler ---
    const handleStarterClick = (starterText: string) => {
        sendMessage(starterText);
    };

    // --- Clear Chat Handler ---
    const handleClearChat = () => {
        setMessages([]);
        setError(null);
    };

    // --- Input Key Press Handler ---
    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleFormSubmit();
        }
    };

    if (!character) {
        return (
            <Container variant="default" className={`w-full ${height} flex items-center justify-center shadow-lg ${className}`}>
                <Typography variant="body1">Select a character to start chatting.</Typography>
            </Container>
        );
    }

    return (
        <Container
            variant="default"
            className={`w-full ${height} flex flex-col shadow-lg !p-0 overflow-hidden ${className}`}
            dir={dir} // Apply the dir prop here
        >
            {/* Chat Header - Try items-start on outer, items-center on inner */}
            <div className="p-4 flex items-start justify-between gap-3 border-b border-gray-700"> {/* Changed to items-start */}
                {/* Group Avatar and Text - Revert to items-center */}
                <div className="flex items-center gap-3"> {/* Changed back to items-center */}
                    {/* Increased Avatar size & added background */}
                    <Avatar className="h-14 w-14 bg-gray-600 flex-shrink-0"> {/* Kept bg-gray-600 and flex-shrink-0 */}
                        <AvatarImage src={character.thumbPath} alt={character.name} />
                        <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {/* Text alignment based on dir */}
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <Typography variant="h4">{character.name}</Typography>
                        {/* Smaller description text */}
                        <Typography variant="body1" className="text-sm text-gray-400">{character.description}</Typography> {/* Changed to text-xs and added color */}
                    </div>
                </div>
                {/* Clear Button */}
                <button
                    onClick={handleClearChat}
                    className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded" // Removed ml-auto
                    title="Clear Chat"
                    disabled={messages.length === 0 || isLoading}
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Message Display Area - Apply dir */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 flex flex-col" dir={dir}>
                {/* Show Starters */}
                {showStarters && messages.length === 0 && character.openingLines && (
                    <div className="flex flex-col items-center gap-4 my-auto">
                        {character.openingLines.map((line, index) => (
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

                {/* Regular Message Mapping - Adjust justify based on role and dir */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? (dir === 'rtl' ? 'justify-end' : 'justify-start') : (dir === 'rtl' ? 'justify-start' : 'justify-end')}`}
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
                {/* Loading Indicator - Align based on assistant role and dir */}
                {isLoading && (
                    <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[70%] p-3 rounded-lg bg-gray-600 text-white animate-pulse">
                            ...
                        </div>
                    </div>
                )}
                {/* Display Error - Centered */}
                {error && (
                    <div className="flex justify-center">
                        <div className="max-w-[70%] p-3 rounded-lg bg-red-600 text-white text-center">
                            Error: {error}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Apply dir */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-600 flex items-center gap-3" dir={dir}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="כתוב את שאלתך כאן..." // Placeholder remains Hebrew
                    className="flex-grow p-2 rounded border border-gray-500 bg-gray-700 text-white focus:outline-none focus:border-blue-500 placeholder-gray-400"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
                    disabled={isLoading || input.trim() === ''}
                >
                    {isLoading ? 'שולח...' : 'שלח'} {/* Button text remains Hebrew */}
                </button>
            </form>
        </Container>
    );
};
