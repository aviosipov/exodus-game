"use client"; // Required for hooks and onClick handler

"use client"; // Required for hooks and onClick handler

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// Removed SimpleButton import as it's now used within MenuButton
import Container from './ui/Container'; // Import the Container component
import { Typography } from './ui/Typography'; // Import the Typography component
import MenuButton from './ui/MenuButton'; // Import the new MenuButton component
// Removed audio-related imports: Volume2, VolumeX, Collapsible
// Removed GameMenu import as it's now in layout

const videoPaths = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
];

// Removed audioFiles definition

const MainMenu: React.FC = () => {
  // Video state and ref
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Removed audio state and refs

  // Removed localStorage effects for audio

  // --- Video Effects ---

  // Cycle through videos every 8 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVideoIndex(prevIndex => (prevIndex + 1) % videoPaths.length);
    }, 8000); // Change video every 8 seconds

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Apply fade-in transition using CSS when video index changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Force opacity to 0 initially when the key changes and the element remounts
      videoElement.style.opacity = '0';
      // Trigger fade-in using a slight delay to allow the element to render with opacity 0
      const timeoutId = setTimeout(() => {
        if (videoElement) { // Check again in case component unmounted during timeout
          videoElement.style.opacity = '1';
        }
      }, 50); // Small delay (50ms)

      // Cleanup timeout if component unmounts or videoIndex changes before timeout fires
      return () => clearTimeout(timeoutId);
    }
  }, [videoIndex]); // Trigger this effect when the video element remounts due to key change

  // Removed Audio Effects

  // Removed Control Handlers for audio


  return (
    <div
      dir="rtl"
      // Removed the ::before classes for background image
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate"
    >
      {/* Removed GameMenu component as it's now in layout */}
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden">
        <video
          ref={videoRef}
          key={videoIndex} // Important: Force re-render when video source changes
          autoPlay
          muted
          loop // Loop the current video until the interval switches it
          playsInline // Important for mobile playback
          // Add CSS transition classes for opacity
          className="object-cover w-full h-full transition-opacity duration-1500 ease-in-out"
          style={{ opacity: 0 }} // Start with opacity 0, useEffect will fade it in
        >
          <source src={videoPaths[videoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Dark Overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/30 -z-10"></div>
      {/* Content container - z-index added, added top padding for mobile (pt-16) */}
      <div className="relative z-0 flex flex-col items-center w-full pt-16 md:pt-0"> {/* Added pt-16 md:pt-0 */}
        {/* Using the new indigo-glow color variant */}
        <Typography variant="h1" color="indigo-glow" className="mb-2"> {/* Use color variant, keep mb-2 */}
           יציאת מצרים: הרפתקה אינטראקטיבית
         </Typography>
         <Typography variant="lead" color="secondary" className="mb-16 drop-shadow-md text-gray-200"> {/* Increased bottom margin from mb-10 to mb-16 */}
           נובלה ויזואלית אינטראקטיבית ומרכז פעילויות המבוסס על סיפור יציאת מצרים.
         </Typography>

         {/* Title for the button grid - Removed colon, changed color, and enhanced glow */}
         <Typography variant="h4" className="mb-6 drop-shadow-lg text-white"> {/* Removed colon, changed color to white, changed drop-shadow-md to drop-shadow-lg */}
           בחר פעילות
         </Typography>

         {/* Primary Actions */}
         {/* Primary Actions - Using Button component */}
         {/* Changed gap-6 to gap-4 md:gap-6 for smaller mobile spacing */}
         {/* Changed md:grid-cols-2 to md:grid-cols-3 for desktop layout */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 w-full max-w-3xl">
           {/* Button 1: Adventure - Using SimpleButton with description */}
           {/* Button 1: Adventure - Using SimpleButton with description */}
          {/* Using MenuButton component with variants */}
          <MenuButton
            variant="default" // Keep original style
            href="/adventure"
            title="הרפתקה"
            description="צאו למסע אינטראקטיבי בעקבות סיפור יציאת מצרים, פרק אחר פרק."
            descriptionClassName="hidden md:block" // Hide description on mobile
          />

          {/* Using MenuButton component with variants */}
          <MenuButton
            variant="default" // Use default variant again
            href="/chat"
            title="שיחה עם דמות"
            description="שוחחו עם דמויות מהסיפור באמצעות בינה מלאכותית ולמדו את נקודת מבטן."
            descriptionClassName="hidden md:block" // Hide description on mobile
          />

          {/* Using MenuButton component with variants */}
          <MenuButton
            variant="default" // Use bright variant
            href="/mini-games"
            title="מיני-משחקים"
            description="בדקו את הידע והכישורים שלכם עם משחקים קצרים המבוססים על הסיפור."
            descriptionClassName="hidden md:block" // Hide description on mobile
          />

        </div> {/* Closing Primary Actions Grid */}

        {/* Secondary/Meta Actions - Using Container component with default (dark) variant */}
        <Container
            variant="default" // Changed variant to 'default'
            className="mt-8 w-full max-w-3xl flex flex-wrap justify-center items-center gap-4 text-sm" // Apply variant and keep layout styles
        >
            {/* Updated Footer Links */}
          <Link
            href="/docs/about"
            className="hover:text-white cursor-pointer"
          >
            <Typography variant="small" color="accent" className="text-amber-100">אודות</Typography> {/* Keep specific color if needed */}
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/docs/index" // Link to the main docs index page
            className="hover:text-white cursor-pointer"
          >
            <Typography variant="small" color="accent" className="text-amber-100">מדריכים</Typography> {/* Changed text to "Guides" */}
          </Link>
          {/* Removed the link to dev-guide as it's linked from the main docs page */}
        </Container> {/* Closing Secondary Actions Container */}
      </div> {/* Closing Content container */}
    </div> /* Closing Main Div */
  );
};

export default MainMenu;
