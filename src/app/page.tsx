"use client"; // Add this directive to make it a client component

import React, { useState } from "react";

export default function Home() {
  // State for game elements
  const [characterName, setCharacterName] = useState("אוהד"); // Ohed in Hebrew
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
          characterName: characterName, // Send current context
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Update state with response from API
      setDialogue(data.dialogue);
      setOptions(data.options);
      setCharacterName(data.characterName); // Update character name if changed by AI
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
      {/* Character Layer */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        {" "}
        {/* Added pointer-events-none to allow clicks through */}
        {/* Character avatar */}
        <div className="w-1/3 h-2/3 flex items-center justify-center overflow-hidden">
          {" "}
          {/* Container for image */}
          <img
            src="/images/ohed_avatar_nobg.png"
            alt="Character Avatar"
            className="object-contain h-full" // Use object-contain to fit image within height, maintaining aspect ratio
          />
        </div>
      </div>

      {/* UI Layer (Dialogue Box) */}
      <div className="absolute bottom-0 left-0 right-0 h-1/4 z-20 p-4">
        <div className="bg-black/70 text-white rounded-lg p-4 h-full border border-gray-600 flex flex-col justify-between">
          <div className="text-right">
            {" "}
            {/* Align text to the right */}
            <h3 className="font-bold text-lg mb-2">{characterName}</h3>
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
