"use client"; // Required for hooks and client-side interactions

import React, { useState, useEffect, useRef } from 'react';
// Removed unused Link import
import { Typography } from '@/components/ui/Typography'; // Import Typography
import MenuButton from '@/components/ui/MenuButton'; // Import MenuButton

// TODO: Fetch this list dynamically from the filesystem or an API route
const adventures = [
    { id: "days_of_honor", title: "ימי הכבוד", description: "פרק ראשון: תחילת הסיפור במצרים." },
    // Add more adventures here as they are created
];

// Video paths from MainMenu/MiniGamesHub
const videoPaths = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
];

export default function AdventureListPage() {
  // Video state and ref from MainMenu/MiniGamesHub
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Video Effects from MainMenu/MiniGamesHub ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVideoIndex(prevIndex => (prevIndex + 1) % videoPaths.length);
    }, 8000); // Change video every 8 seconds
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.style.opacity = '0';
      const timeoutId = setTimeout(() => {
        if (videoElement) {
          videoElement.style.opacity = '1';
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [videoIndex]);

  return (
    <div
      dir="rtl"
      // Structure from MainMenu/MiniGamesHub
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate"
    >
      {/* Video Background from MainMenu/MiniGamesHub */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
        <video
          ref={videoRef}
          key={videoIndex}
          autoPlay
          muted
          loop
          playsInline
          className="object-cover w-full h-full transition-opacity duration-1500 ease-in-out"
          style={{ opacity: 0 }}
        >
          <source src={videoPaths[videoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Dark Overlay from MainMenu/MiniGamesHub */}
      <div className="absolute inset-0 w-full h-full bg-black/30 -z-10"></div>

      {/* Content container from MainMenu/MiniGamesHub */}
      <div className="relative z-0 flex flex-col items-center w-full">
        {/* Title using Typography */}
        <Typography variant="h1" color="indigo-glow" className="mb-2">
          הרפתקה
        </Typography>
        {/* Subtitle using Typography */}
        <Typography variant="lead" color="secondary" className="mb-10 drop-shadow-md text-gray-200">
          צאו למסע אינטראקטיבי בעקבות סיפור יציאת מצרים, פרק אחר פרק.
        </Typography>

        {/* Title for the button grid */}
        <Typography variant="h4" className="mb-6 drop-shadow-lg text-white">
          בחר פרק
        </Typography>

        {/* Grid for adventure selection, using MenuButton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
          {adventures.length > 0 ? (
            adventures.map((adventure) => (
              <MenuButton
                key={adventure.id}
                variant="dark" // Use the dark variant
                title={adventure.title}
                description={adventure.description || 'לחץ כאן כדי להתחיל...'} // Use description or fallback
                href={`/adventure/${adventure.id}`}
                className="min-h-[8rem]" // Keep height adjustment
                // Optional: Add actions if needed later
                // actions={<Link href={`/docs/adventures/${adventure.id}`}>[תיעוד]</Link>}
              />
            ))
          ) : (
            <Typography variant="body1" color="secondary" className="col-span-full text-center">
              לא נמצאו פרקים זמינים כרגע.
            </Typography>
          )}
           {/* Optional: Add placeholders if needed */}
           <MenuButton
            variant="dark"
            title="בקרוב..."
            description="פרקים נוספים יתווספו בהמשך."
            className="min-h-[8rem]"
            disabled
          />
           <MenuButton
            variant="dark"
            title="בקרוב..."
            description="פרקים נוספים יתווספו בהמשך."
            className="min-h-[8rem]"
            disabled
          />
        </div> {/* Closing Grid */}



      </div> {/* Closing Content container */}
    </div> /* Closing Main Div */
  );
}
