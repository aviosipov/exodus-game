"use client"; // Required for useState, useEffect, event handlers

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components

// Define message structure
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Default character and background
const CHARACTER_IMG = "/images/ohad_avatar_nobg.png"; // Using Ohad as default
const BACKGROUND_IMG = "/images/ancient_egypt_prosperity_bg.webp"; // Using adventure background

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Character selection not yet implemented
  const [characterName, _setCharacterName] = useState('אוהד'); // Default character name, silence unused setter
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Placeholder for initial greeting or loading state
  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `שלום! אני ${characterName}. מה תרצה לשאול אותי?` } // Initial greeting
    ]);
  }, [characterName]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    // Placeholder for AI response - replace with actual API call later
    const aiResponse: Message = { sender: 'ai', text: `זו תגובה זמנית לשאלתך: "${inputValue}"` };

    setMessages(prevMessages => [...prevMessages, userMessage, aiResponse]);
    setInputValue(''); // Clear input field
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div
      dir="rtl" // Right-to-left for Hebrew
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center" // Changed items-end back to items-center
      style={{ backgroundImage: `url('${BACKGROUND_IMG}')` }}
    >
      {/* Right Side: Chat UI (Takes 1/3 width, increased margin, height 80vh, vertically centered) - Placed first due to RTL */}
      <div className="w-1/3 h-[80vh] flex flex-col bg-black/80 border-s-2 border-gray-600 m-8 rounded-lg shadow-lg"> {/* Changed m-4 to m-8 */}
        {/* Chat Header with Avatar */}
        <div className="p-4 border-b border-gray-600 flex items-center justify-start gap-3"> {/* Changed justify-end to justify-start for RTL */}
          <Avatar className="h-12 w-12"> {/* Added size classes */}
            <AvatarImage src={CHARACTER_IMG} alt={characterName} />
            <AvatarFallback>{characterName.charAt(0)}</AvatarFallback> {/* Fallback to first initial */}
          </Avatar>
          <div className="text-right"> {/* Text group second in code -> visually left of avatar */}
            <h2 className="text-xl font-semibold text-white">{characterName}</h2>
            <p className="text-sm text-gray-300">דמות היסטורית מתקופת יציאת מצרים</p> {/* Placeholder Description */}
          </div>
        </div>
        {/* Message Display Area */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`} // User left, AI right (in RTL)
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {/* Empty div to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-600 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="כתוב את שאלתך כאן..."
            className="flex-grow p-2 rounded border border-gray-500 bg-gray-800 text-white focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-300"
          >
            שלח {/* Send */}
          </button>
        </div>
         {/* Back to Main Menu Button */}
         <div className="p-2 text-center border-t border-gray-600">
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            חזרה לתפריט הראשי
            </Link>
        </div>
      </div>

      {/* Left Side: Character Display (Takes 2/3 width) - Placed second due to RTL */}
      <div className="w-2/3 h-full flex items-end justify-center p-10 relative"> {/* Keep width 2/3 */}
         {/* Character Image */}
         <div
            className={`character h-[80%] w-full bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out opacity-100`}
            style={{ backgroundImage: `url('${CHARACTER_IMG}')` }}
         ></div>
         {/* Optional: Character Name Display */}
         <div className="absolute top-10 left-10 bg-black/50 text-white p-2 rounded">
            {characterName}
         </div>
      </div>
    </div>
  );
}
