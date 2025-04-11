"use client"; // Required for hooks and client-side interactions

import React from 'react';
import HebrewTriviaGame from '@/components/mini-games/hebrew-trivia/HebrewTriviaGame';
import { earlyChapterSet } from '@/components/mini-games/hebrew-trivia/questionSets'; // Using one set for this standalone page

const HebrewTriviaPage: React.FC = () => {
  // Dummy handler for when the game completes on this standalone page
  const handleGameComplete = (finalScore: number) => {
    console.log(`Standalone Trivia Game Completed! Final Score: ${finalScore}`);
    // The HebrewTriviaGame component now handles displaying the end screen UI itself.
    // No need for an alert here on the standalone page.
  };

  return (
    // Apply Millionaire-style background
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-4">
      <HebrewTriviaGame
        questionSet={earlyChapterSet} // Provide the desired question set
        onGameComplete={handleGameComplete}
        topic_he="טריוויה: תחילת השעבוד" // Pass the topic here
      />
    </div>
  );
};

export default HebrewTriviaPage;
