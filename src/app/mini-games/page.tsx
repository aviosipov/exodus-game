"use client"; // Required for hooks and client-side interactions

import React, { useState, useEffect } from 'react'; // Removed useRef
// Removed duplicate import line
// Removed Container and Button imports
import { Typography } from '@/components/ui/Typography'; // Import Typography
import MenuButton from '@/components/ui/MenuButton'; // Import MenuButton

// Array of new background image paths
const backgroundImages = [
  '/images/mini-games-bg/games_toys_1.png',
  '/images/mini-games-bg/childrens_room_1.png',
  '/images/mini-games-bg/childrens_room_2.png',
  '/images/mini-games-bg/games_toys_2.png',
];

export default function MiniGamesHub() {
  // State for the selected background image
  const [backgroundImage, setBackgroundImage] = useState('');

  // Effect to select a random background image on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    setBackgroundImage(backgroundImages[randomIndex]);
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div
      dir="rtl"
      // Apply background image via inline style, keep other layout classes
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate bg-cover bg-center"
      style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
    >
      {/* Removed Video Background Section */}
      {/* Keep Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/50 -z-10"></div> {/* Slightly darker overlay */}
      {/* Content container from MainMenu */}
      <div className="relative z-0 flex flex-col items-center w-full">
        {/* Title using Typography, styled like MainMenu */}
        <Typography variant="h1" color="indigo-glow" className="mb-2">
          מיני-משחקים
        </Typography>
        {/* Subtitle using Typography */}
        <Typography variant="lead" color="secondary" className="mb-10 drop-shadow-md text-gray-200"> {/* Reduced margin bottom back to mb-10 */}
          בדקו את הידע והכישורים שלכם עם משחקים קצרים המבוססים על הסיפור.
        </Typography>

        {/* Title for the button grid - Added like MainMenu */}
        <Typography variant="h4" className="mb-6 drop-shadow-lg text-white">
          בחר משחק
        </Typography>

        {/* Grid for game cards, using MenuButton with secondary variant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl"> {/* Adjusted grid cols */}
          {/* Space Invaders Button */}
          <MenuButton
            variant="dark" // Use the new dark variant
            title="חלליות פולשות"
            description="הגן על התקווה שלך מול סכנות ומכשולים"
            href="/mini-games/space-invaders"
            className="min-h-[8rem]" // Keep height adjustment
            actions={
              <a href="/docs/space-invaders" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                [תיעוד]
              </a>
            }
          />

          {/* Daily Task Manager Button */}
          <MenuButton
            variant="dark" // Use the new dark variant
            title="ניהול משימות צוות יומי"
            description="נהל את המשימות היומיות של העובדים והמשאבים לעמידה ביעדים"
            href="/mini-games/daily-task-manager"
            className="min-h-[8rem]" // Keep height adjustment
            actions={
              <a href="/docs/daily-task-manager" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                [תיעוד]
              </a>
            }
          />

          {/* Hebrew Trivia Button */}
          <MenuButton
            variant="dark" // Use the new dark variant
            title="טריוויה עברית"
            description="השלם את הפסוק והציווי במשחק ידע מרתק"
            href="/mini-games/hebrew-trivia"
            className="min-h-[8rem]" // Keep height adjustment
            actions={
              <a href="/docs/hebrew-trivia" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 hover:underline">
                [תיעוד]
              </a>
            }
          />

          {/* Placeholder for potential 4th button */}
           <MenuButton
            variant="dark" // Use the new dark variant
            title="בקרוב..."
            description="משחקים נוספים יתווספו בהמשך."
            // Keep only the page-specific layout adjustment
            className="min-h-[8rem]"
            // Removed titleClassName and descriptionClassName overrides
            disabled // Disable the button
          />
        </div> {/* Closing Grid */}

        {/* Removed Back Button Section */}

      </div> {/* Closing Content container */}
    </div> /* Closing Main Div */
  );
}

// Removed GameCard component and interface
