"use client"; // Add this directive to make it a client component

import React, { useState } from "react";

// Define character data
const characters = [
  { name: "אוהד", imagePath: "/images/ohad_avatar_nobg.png" }, // Ohad
  { name: "עוזיריס", imagePath: "/images/oziris_avatar_nobg.png" }, // Oziris (using a plausible Hebrew spelling)
  { name: "יששכר", imagePath: "/images/yishachar_avatar_nobg.png" }, // Yishachar
  { name: "אחמוס", imagePath: "/images/ahmos_avatar_nobg.png" }, // Ahmos (using a plausible Hebrew spelling)
];

export default function Home() {
  // State for game elements
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]); // Start with Ohad
  const [dialogue, setDialogue] = useState(
    "ברוכים הבאים לאחוזתי. זו תקופה שלווה במצרים, הלא כן?" // "Welcome to my estate. It is a peaceful time in Egypt, is it not?" in Hebrew
  );
  const [options, setOptions] = useState([
    "התפעל מהאחוזה", // "Admire the estate" in Hebrew
    "שאל על חייו", // "Ask about his life" in Hebrew
  ]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Function to handle option clicks and interact with the API
  const handleOptionClick = async (optionText: string) => {
    console.log(`Selected option: ${optionText}`);
    setIsLoading(true); // Set loading true
    setError(null); // Clear previous errors

    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedOption: optionText,
          currentDialogue: dialogue, // Send current context
          characterName: selectedCharacter.name, // Send selected character's name
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update state with response from API
      setDialogue(data.dialogue);
      setOptions(data.options);
      // Assuming API might still return characterName if it can change dynamically
      // If API *only* returns dialogue/options based on input character, this line might need adjustment/removal
      // For now, find the character object matching the returned name, or default to current if not found/changed
      const returnedCharacter = characters.find(c => c.name === data.characterName) || selectedCharacter;
      setSelectedCharacter(returnedCharacter);
    } catch (err) {
      console.error("Interaction failed:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      // Optionally reset to a safe state or show error message in dialogue
      setDialogue("An error occurred. Please try again.");
      setOptions(["Retry Last Action (not implemented)"]);
    } finally {
      setIsLoading(false); // Set loading false
    }
  };

  return (
    <div
      dir="rtl" // Add RTL direction attribute
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/images/ancient_egypt_prosperity_bg.webp')",
      }}
    >
      {/* Character Selection UI (Top Left) */}
      <div className="absolute top-4 left-4 z-30 bg-black/50 p-2 rounded">
        <h4 className="text-white text-sm mb-1 text-center">בחר דמות</h4> {/* Select Character */}
        <div className="flex flex-col space-y-1">
          {characters.map((char) => (
            <button
              key={char.name}
              onClick={() => setSelectedCharacter(char)}
              className={`px-2 py-1 text-xs rounded ${
                selectedCharacter.name === char.name
                  ? "bg-blue-700 text-white"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500"
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      </div>

      {/* Character Layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {" "}
        {/* Added pointer-events-none to allow clicks through */}
        {/* Character avatar */}
        <div className="w-1/3 h-2/3 flex items-center justify-center overflow-hidden">
          {" "}
          {/* Container for image */}
          <img
            src={selectedCharacter.imagePath}
            alt={`${selectedCharacter.name} Avatar`}
            className="object-contain h-full" // Use object-contain to fit image within height, maintaining aspect ratio
            key={selectedCharacter.name} // Add key to force re-render on character change
          />
        </div>
      </div>

      {/* UI Layer (Dialogue Box) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 z-20 p-4">
        <div className="bg-black/70 text-white rounded-lg p-4 h-full border border-gray-600 flex flex-col justify-between">
          <div className="text-right">
            {" "}
            {/* Align text to the right */}
            <h3 className="font-bold text-lg mb-2">{selectedCharacter.name}</h3>
            <p className="text-base">{isLoading ? "Thinking..." : dialogue}</p>
            {error && (
              <p className="text-red-500 text-sm mt-2">Error: {error}</p>
            )}
          </div>
          {/* Justify buttons to the start (left in RTL), use margin for spacing */}
          <div className="flex justify-start">
            {/* Render options dynamically, disable buttons when loading */}
            {options.map((option, index) => (
              <button
                key={index}
                // Add ms-2 for margin-start (left margin in RTL)
                className={`ms-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handleOptionClick(option)}
                disabled={isLoading}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
