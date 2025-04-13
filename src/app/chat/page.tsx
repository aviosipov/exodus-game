"use client"; // Required for useState, useEffect, event handlers

import React, { useState, useEffect, useRef } from "react";
// Removed unused Link import
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatar components
import Container from "@/components/ui/Container"; // Import Container
import Button from "@/components/ui/Button"; // Import Button

// Define character structure
interface Character {
  name: string;
  imagePath: string;
  description: string;
}

// Define available characters
const availableCharacters: Character[] = [
  { name: 'אוהד', imagePath: '/images/ohad_avatar_nobg.png', description: 'דמות היסטורית מתקופת יציאת מצרים' },
  { name: 'אחמוס', imagePath: '/images/ahmos_avatar_nobg.png', description: 'פרעה מצרי קדום' },
  { name: 'אוזיריס', imagePath: '/images/oziris_avatar_nobg.png', description: 'אל מצרי קדום' },
  { name: 'יששכר', imagePath: '/images/yishachar_avatar_nobg.png', description: 'דמות מקראית' },
  // Add other characters as needed, ensure image paths are correct
];


// Define message structure
interface Message {
  sender: 'user' | 'ai';
  text: string;
}

// Default background
const BACKGROUND_IMG = "/images/ancient_egypt_prosperity_bg.webp"; // Using adventure background

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentCharacter, setCurrentCharacter] = useState<Character>(availableCharacters[0]); // Default to the first character
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Update greeting when character changes
  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `שלום! אני ${currentCharacter.name}. מה תרצה לשאול אותי?` } // Initial greeting based on selected character
    ]);
  }, [currentCharacter]);

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
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex items-center"
      style={{ backgroundImage: `url('${BACKGROUND_IMG}')` }}
    >
      {/* Character Selection UI - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2 space-x-reverse"> {/* Use space-x-reverse for RTL */}
        {availableCharacters.map((char) => (
          <Avatar
            key={char.name}
            className={`h-16 w-16 cursor-pointer border-2 ${currentCharacter.name === char.name ? 'border-blue-500' : 'border-transparent'} hover:border-blue-300`} // Increased size h-16 w-16
            onClick={() => setCurrentCharacter(char)}
            title={char.name} // Tooltip for character name
          >
            <AvatarImage src={char.imagePath} alt={char.name} />
            <AvatarFallback>{char.name.charAt(0)}</AvatarFallback>
          </Avatar>
        ))}
      </div>

      {/* Right Side: Chat UI - Using Container */}
      <Container
        variant="dialog"
        className="w-1/3 h-[80vh] flex flex-col m-8 shadow-lg !p-0" // Use variant, add layout, remove padding override
      >
        {/* Chat Header with Avatar - Keep padding here */}
        <div className="p-4 border-b border-gray-600 flex items-center justify-start gap-3"> {/* Keep internal padding */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={currentCharacter.imagePath} alt={currentCharacter.name} />
            <AvatarFallback>{currentCharacter.name.charAt(0)}</AvatarFallback> {/* Fallback to first initial */}
          </Avatar>
          <div className="text-right"> {/* Text group second in code -> visually left of avatar */}
            <h2 className="text-xl font-semibold text-white">{currentCharacter.name}</h2>
            <p className="text-sm text-gray-300">{currentCharacter.description}</p> {/* Use character description */}
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
            className="flex-grow p-2 rounded border border-gray-500 bg-gray-700 text-white focus:outline-none focus:border-blue-500 placeholder-gray-400" // Adjusted bg slightly
          />
          {/* Use Button component - Corrected variant, removed size */}
          <Button onClick={handleSendMessage} variant="primary"> {/* Use primary button */}
            שלח {/* Send */}
          </Button>
        </div>
         {/* Removed Back to Main Menu Button */}
      </Container> {/* Close Container */}

      {/* Left Side: Character Display (Takes 2/3 width) - Placed second due to RTL */}
      <div className="w-2/3 h-full flex items-end justify-center p-10 relative"> {/* Keep width 2/3 */}
         {/* Character Image - Updated to use state */}
         <div
            key={currentCharacter.name} // Add key to force re-render on character change if needed for transitions
            className={`character h-[80%] w-full bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out opacity-100`}
            style={{ backgroundImage: `url('${currentCharacter.imagePath}')` }}
         ></div>
         {/* Removed Character Name Display from top-left */}
      </div>
    </div>
  );
}
