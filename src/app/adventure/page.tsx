"use client"; // Required for hooks and client-side interactions

import React, { useState, useEffect, useRef } from 'react';
import { Typography } from '@/components/ui/Typography'; // Import Typography
import MenuButton from '@/components/ui/MenuButton'; // Import MenuButton
import { Volume2 } from 'lucide-react'; // Import the icon

// Interface for the adventure data fetched from the API
interface AdventureInfo {
    id: string;
    title: string;
    description: string;
    voiceOver?: boolean; // Add the voiceOver flag
}

// Video paths from MainMenu/MiniGamesHub - Keep this part
const videoPaths = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
];

export default function AdventureListPage() {
  // Video state and ref - Keep this part
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for fetched adventures, loading, and errors
  const [fetchedAdventures, setFetchedAdventures] = useState<AdventureInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch Adventures ---
  useEffect(() => {
    const fetchAdventures = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/adventures');
        if (!response.ok) {
          throw new Error(`Failed to fetch adventures: ${response.statusText}`);
        }
        const data: AdventureInfo[] = await response.json();
        setFetchedAdventures(data);
      } catch (err) {
        console.error("Error fetching adventures:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
        setFetchedAdventures([]); // Clear adventures on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdventures();
  }, []); // Empty dependency array means this runs once on mount

  // --- Video Effects - Keep this part ---
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
      {/* Content container from MainMenu/MiniGamesHub - Added top padding for mobile */}
      <div className="relative z-0 flex flex-col items-center w-full pt-16 md:pt-0"> {/* Added pt-16 md:pt-0 */}
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
          {isLoading ? (
            <Typography variant="body1" color="secondary" className="col-span-full text-center">
              טוען פרקים...
            </Typography>
          ) : error ? (
            <Typography variant="body1" color="destructive" className="col-span-full text-center">
              שגיאה בטעינת הפרקים: {error}
            </Typography>
          ) : fetchedAdventures.length > 0 ? (
            fetchedAdventures.map((adventure) => (
              <MenuButton
                key={adventure.id}
                variant="dark" // Use the dark variant
                title={adventure.title} // Pass title as string
                titlePrefix={adventure.voiceOver ? <Volume2 className="w-4 h-4 text-blue-300" /> : undefined} // Pass icon to prefix prop
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
           {/* Optional: Add placeholders if needed - Keep these */}
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
