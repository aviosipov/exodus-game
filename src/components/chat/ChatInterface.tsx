"use client";

import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent, ReactNode } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Container from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";
import { CopyButton } from "@/components/ui/CopyButton";

// Define Character structure
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
    response_id?: string;
}

// Simple ID generator
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

interface ChatInterfaceProps {
    character: Character | null;
    initialMessages?: Message[];
    showStarters?: boolean;
    className?: string;
    onMessagesUpdate?: (messages: Message[]) => void;
    height?: string;
    dir?: 'ltr' | 'rtl';
    initialContext?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    character,
    initialMessages = [],
    showStarters = true,
    className = "",
    onMessagesUpdate,
    height = "h-full",
    dir = 'ltr',
    initialContext
}) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Helper to extract text content from React nodes for CopyButton
    const getNodeText = (node: ReactNode): string => {
      if (typeof node === 'string') {
        return node;
      }
      if (Array.isArray(node)) {
        return node.map(getNodeText).join('');
      }
      if (React.isValidElement<{ children?: ReactNode }>(node) && node.props.children) {
        return getNodeText(node.props.children);
      }
      return '';
    };

    // Effect to scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Effect to update parent
    useEffect(() => {
        if (onMessagesUpdate) {
            onMessagesUpdate(messages);
        }
    }, [messages, onMessagesUpdate]);

    // Input Change Handler
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    // Get Last Assistant Response ID
    const getLastAssistantResponseId = (): string | null => {
        const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
        return lastAssistantMessage?.response_id || null;
    };

    // Send Message Function
    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim() || isLoading || !character) return;
        const newUserMessage: Message = { id: generateId(), role: 'user', content: messageContent };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);
        const lastAssistantId = getLastAssistantResponseId();
        const isFirstMessage = messages.length === 0;
        const messagesToSend = [...messages, newUserMessage];
        const requestBody = {
            messages: messagesToSend,
            body: {
                characterId: character.id,
                previous_response_id: lastAssistantId,
                ...(isFirstMessage && initialContext && { initial_context: initialContext })
            }
        };
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
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
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // Form Submission Handler
    const handleFormSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    // Starter Click Handler
    const handleStarterClick = (starterText: string) => {
        sendMessage(starterText);
    };

    // Clear Chat Handler
    const handleClearChat = () => {
        setMessages([]);
        setError(null);
    };

    // Key Press Handler
    const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleFormSubmit();
        }
    };

    // Render logic
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
            dir={dir}
        >
            {/* Chat Header */}
            <div className="p-4 flex items-start justify-between gap-3 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 bg-gray-600 flex-shrink-0">
                        <AvatarImage src={character.thumbPath} alt={character.name} />
                        <AvatarFallback>{character.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                        <Typography variant="h4">{character.name}</Typography>
                        <Typography variant="body1" className="text-sm text-gray-400">{character.description}</Typography>
                    </div>
                </div>
                <button
                    onClick={handleClearChat}
                    className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 rounded"
                    title="Clear Chat"
                    disabled={messages.length === 0 || isLoading}
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Message Display Area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 flex flex-col" dir={dir}>
                {/* Starters */}
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

                {/* Messages */}
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex mb-4 ${msg.role === 'user' ? (dir === 'rtl' ? 'justify-end' : 'justify-start') : (dir === 'rtl' ? 'justify-start' : 'justify-end')}`}
                    >
                        {/* Cleaned className structure */}
                        <div
                            className={`max-w-[90%] p-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}`} /* Increased max-width */
                        >
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none text-white">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            // Simplified pre component props handling
                                            pre: (props) => {
                                                const { children, className: preClassName, ...restProps } = props;
                                                const codeText = getNodeText(children);
                                                const combinedClassName = `${preClassName || ''} force-ltr-code`.trim();
                                                return (
                                                  <div className="relative group my-2">
                                                    <pre {...restProps} className={combinedClassName}>
                                                      {children}
                                                    </pre>
                                                    <CopyButton
                                                      textToCopy={codeText}
                                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 p-1 rounded text-white"
                                                    />
                                                  </div>
                                                );
                                            },
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Loading Indicator */}
                {isLoading && (
                    <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                        <div className="max-w-[90%] p-3 rounded-lg bg-gray-600 text-white animate-pulse"> {/* Increased max-width */}
                            ...
                        </div>
                    </div>
                )}
                {/* Error Display */}
                {error && (
                    <div className="flex justify-center">
                        <div className="max-w-[90%] p-3 rounded-lg bg-red-600 text-white text-center"> {/* Increased max-width */}
                            Error: {error}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-600 flex items-center gap-3" dir={dir}>
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
    );
};
