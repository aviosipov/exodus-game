"use client"; // Required for hooks and onClick handler

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
// Removed static animejs import

const videoPaths = [
  '/videos/video1.mp4',
  '/videos/video2.mp4',
  '/videos/video3.mp4',
  '/videos/video4.mp4',
];

const MainMenu: React.FC = () => {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <div
      dir="rtl"
      // Removed the ::before classes for background image
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate"
    >
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

      {/* Content container - z-index added to ensure it's above the background */}
      <div className="relative z-0 flex flex-col items-center w-full">
        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-md">יציאת מצרים: הרפתקה אינטראקטיבית</h1>
        <p className="text-lg text-gray-200 mb-10 drop-shadow-md">נובלה ויזואלית אינטראקטיבית ומרכז פעילויות המבוסס על סיפור יציאת מצרים.</p>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
          {/* Button 1: Adventure */}
          <Link href="/adventure" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-green-700 mb-2">הרפתקה</h2>
              <p className="text-gray-700">צאו למסע אינטראקטיבי בעקבות סיפור יציאת מצרים, פרק אחר פרק.</p>
          </div>
        </Link>

          {/* Button 2: Mini-games */}
          <Link href="/mini-games" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-yellow-700 mb-2">מיני-משחקים</h2>
              <p className="text-gray-700">בדקו את הידע והכישורים שלכם עם משחקים קצרים המבוססים על הסיפור.</p>
          </div>
        </Link>

          {/* Button 3: Chat */}
          <Link href="/chat" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">שיחה עם דמות</h2>
              <p className="text-gray-700">שוחחו עם דמויות מהסיפור באמצעות בינה מלאכותית ולמדו את נקודת מבטן.</p>
          </div>
        </Link>

          {/* Button 4: Options */}
          <button
            onClick={() => alert('פתח אפשרויות')} // Placeholder action
            className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-right border border-gray-200 w-full backdrop-blur-sm"
          >
            <h2 className="text-2xl font-semibold text-red-700 mb-2">אפשרויות</h2>
            <p className="text-gray-700">התאימו את הגדרות המשחק, כמו עוצמת השמע.</p>
        </button>
        </div> {/* Closing Primary Actions Grid */}

        {/* Secondary/Meta Actions */}
        <div className="border-t border-gray-400 pt-6 mt-8 w-full max-w-3xl flex flex-wrap justify-center gap-4 text-sm bg-black/20 rounded px-4 py-2 backdrop-blur-sm">
          <Link href="/about" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">אודות</span>
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/edit" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">עריכת תוכן</span>
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/dev-guides" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">מדריכים למפתחים</span>
          </Link>
        </div> {/* Closing Secondary Actions Div */}
      </div> {/* Closing Content container */}
    </div> /* Closing Main Div */
  );
};

export default MainMenu;
