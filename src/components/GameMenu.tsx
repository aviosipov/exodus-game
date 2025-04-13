"use client";

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import AudioPlayer from './AudioPlayer'; // Import the existing AudioPlayer

const GameMenu: React.FC = () => {
  return (
    // Reduced gap to gap-2 and added items-stretch for height alignment
    <div className="fixed top-4 left-4 z-50 flex items-stretch gap-2">
      {/* Audio Player Section (Placed first for LTR layout) */}
      <AudioPlayer />

      {/* Home Button Section (Placed second for LTR layout - appears visually right) */}
      <Link
        href="/"
        // Increased size to w-12 h-12 for a larger square shape, kept flex centering
        className="w-12 h-12 bg-gray-100/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-200/90 transition-colors border border-gray-400 flex items-center justify-center"
        title="חזור לדף הראשי" // Tooltip: Return to main page
      >
        <Home className="w-5 h-5 text-cyan-900" />
      </Link>
    </div>
  );
};

export default GameMenu;
