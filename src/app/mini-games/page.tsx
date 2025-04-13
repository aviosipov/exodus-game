"use client"; // Required for hooks and client-side interactions

import React, { useState, useEffect } from 'react'; // Removed useRef
import Link from 'next/link'; // Import Link
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

        {/* Grid for game cards, each item now a container div */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl"> {/* Adjusted grid cols */}
          {/* Space Invaders Button Container */}
          <div className="flex flex-col items-start"> {/* Container for button + link */}
            <MenuButton
              variant="dark"
              title="חלליות פולשות"
              description="הגן על התקווה שלך מול סכנות ומכשולים"
              href="/mini-games/space-invaders"
              className="min-h-[8rem] w-full" // Ensure button takes full width of container
              // Removed actions prop
            />
            {/* Documentation Link - Placed outside MenuButton */}
            <Link href="/docs/space-invaders" passHref legacyBehavior>
              <a
                rel="noopener noreferrer"
                className="mt-2 text-sm text-gray-900 hover:text-black hover:underline font-light self-start bg-yellow-300/70 px-1 rounded-sm" // Added bg opacity, padding, rounded corners, adjusted text color
              >
                [תיעוד]
              </a>
            </Link>
          </div>

          {/* Daily Task Manager Button Container */}
          <div className="flex flex-col items-start"> {/* Container for button + link */}
            <MenuButton
              variant="dark"
              title="ניהול משימות צוות יומי"
              description="נהל את המשימות היומיות של העובדים והמשאבים לעמידה ביעדים"
              href="/mini-games/daily-task-manager"
              className="min-h-[8rem] w-full" // Ensure button takes full width of container
              // Removed actions prop
            />
            {/* Documentation Link - Placed outside MenuButton */}
            <Link href="/docs/daily-task-manager" passHref legacyBehavior>
              <a
                rel="noopener noreferrer"
                className="mt-2 text-sm text-gray-900 hover:text-black hover:underline font-light self-start bg-yellow-300/70 px-1 rounded-sm" // Added bg opacity, padding, rounded corners, adjusted text color
              >
                [תיעוד]
              </a>
            </Link>
          </div>

          {/* Hebrew Trivia Button Container */}
          <div className="flex flex-col items-start"> {/* Container for button + link */}
            <MenuButton
              variant="dark"
              title="טריוויה עברית"
              description="השלם את הפסוק והציווי במשחק ידע מרתק"
              href="/mini-games/hebrew-trivia"
              className="min-h-[8rem] w-full" // Ensure button takes full width of container
              // Removed actions prop
            />
            {/* Documentation Link - Placed outside MenuButton */}
            <Link href="/docs/hebrew-trivia" passHref legacyBehavior>
              <a
                rel="noopener noreferrer"
                className="mt-2 text-sm text-gray-900 hover:text-black hover:underline font-light self-start bg-yellow-300/70 px-1 rounded-sm" // Added bg opacity, padding, rounded corners, adjusted text color
              >
                [תיעוד]
              </a>
            </Link>
          </div>

          {/* Placeholder for potential 4th button */}
          <div className="flex flex-col items-start"> {/* Container for consistency */}
            <MenuButton
              variant="dark" // Use the new dark variant
              title="בקרוב..."
              description="משחקים נוספים יתווספו בהמשך."
              // Keep only the page-specific layout adjustment
              className="min-h-[8rem] w-full" // Ensure button takes full width
              // Removed titleClassName and descriptionClassName overrides
              disabled // Disable the button
            />
            {/* No documentation link for placeholder */}
          </div>
        </div> {/* Closing Grid */}

        {/* Removed Back Button Section */}

      </div> {/* Closing Content container */}
    </div> /* Closing Main Div */
  );
}

// Removed GameCard component and interface
