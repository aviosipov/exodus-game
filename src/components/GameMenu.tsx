"use client";

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react'; // Import BookOpen icon
import AudioPlayer from './AudioPlayer'; // Import the existing AudioPlayer

const GameMenu: React.FC = () => {
  return (
    // Reduced gap to gap-2 and added items-stretch for height alignment
    <div className="fixed top-4 left-4 z-50 flex items-stretch gap-2">
      {/* Audio Player Section (Placed first for LTR layout) */}
      <AudioPlayer />
      {/* Home Button Section (Placed second for LTR layout - appears visually right) */}
      {/* Docs Button Section */}
      <Link
        href="/docs/index" // Link to the documentation index page
        // Use similar styling as the Home button
        className="w-12 h-12 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-200/90 transition-colors border border-gray-400 flex items-center justify-center"
        // Tooltip: Documentation
        title="תיעוד"
      >
        <BookOpen className="w-5 h-5 text-cyan-900" /> {/* Use BookOpen icon */}
      </Link>
      <Link
        href="/"
        // Increased size to w-12 h-12 for a larger square shape, kept flex centering
        className="w-12 h-12 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-200/90 transition-colors border border-gray-400 flex items-center justify-center"
        // Tooltip: Return to main page
        title="חזור לדף הראשי"
      >
        <Home className="w-5 h-5 text-cyan-900" />
      </Link>

    </div>
  );
};

export default GameMenu;
