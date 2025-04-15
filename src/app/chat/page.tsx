"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Removed Container and Typography as they are now inside ChatInterface
// Import the new ChatInterface component and its Character type
import { ChatInterface, Character } from "@/components/chat/ChatInterface";

// Default background remains the same
const BACKGROUND_IMG = "/images/ancient_egypt_prosperity_bg.webp";

export default function ChatPage() {
  // --- State Management ---
  const [allCharacters, setAllCharacters] = useState<Character[]>([]); // State to hold loaded characters
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null); // Start with null initially
  const [error, setError] = useState<string | null>(null); // Keep error state for character loading

  // --- Effects ---
  // Effect to load characters on component mount
  useEffect(() => {
    const fetchCharacters = async () => {
      // Define the known character IDs (folder names)
      // Filter out "tomer" for the main chat page
      const characterIds = ["moses", "elisheva", "pharaoh", "ahmos", "issachar", "osiris", "ohad"]; // Removed "tomer"
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

  // Removed chat-specific logic (messages, input, handlers, API calls)
  // These are now handled by ChatInterface

  return (
    <div
      dir="rtl" // Right-to-left for Hebrew
      // Changed flex direction for mobile, normal row order on md+, adjusted justification
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col md:flex-row items-center md:justify-between" // Removed md:flex-row-reverse
      style={{ backgroundImage: `url('${BACKGROUND_IMG}')` }}
    >
      {/* Right Side Wrapper (Chat + Selection) - Takes full width on mobile, 1/3 on md+. Added top padding for mobile (pt-16) */}
      {/* This is now the RIGHT side on desktop */}
      {/* Right Side Wrapper (Chat + Selection) */}
      <div className="w-full md:w-1/3 h-full md:h-[90vh] flex flex-col items-center pt-16 p-4 md:pt-4 md:m-8">
        {/* Character Selection UI (Remains the same) */}
        <div className="flex space-x-2 space-x-reverse mb-4 min-h-[72px]">
          {allCharacters.length === 0 && !error && <p className="text-white">Loading characters...</p>}
          {error && <p className="text-red-500">Error: {error}</p>} {/* Display loading error */}
          {allCharacters.map((char) => ( // Removed explicit type, inferred
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

        {/* Render the reusable ChatInterface component */}
        <ChatInterface
          character={currentCharacter}
          showStarters={true}
          className="w-full h-full"
          dir="rtl" // Explicitly pass rtl for the main chat page
        />
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
