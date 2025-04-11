"use client"; // Required for hooks and client-side interactions

import React from 'react';
import WorkerTaskManagerGame from '@/components/mini-games/daily-task-manager/WorkerTaskManagerGame'; // Renamed component
import { brickMakingScenario } from '@/components/mini-games/daily-task-manager/taskSets'; // Using NEW scenario
import { GameResult } from '@/components/mini-games/daily-task-manager/types'; // Import GameResult type

const DailyTaskManagerPage: React.FC = () => {
  // Dummy handler for when the game completes on this standalone page
  const handleGameComplete = (result: GameResult) => {
    console.log(`Standalone Worker Task Manager Game Completed!`); // Updated log message
    console.log(`Success: ${result.success}`);
    console.log(`Final Shared Resources:`, result.finalSharedResources); // Updated property name
    console.log(`Final Workers:`, result.finalWorkers); // Log final worker states
    console.log(`Goal Achievement:`, result.goalAchievement);
    // The WorkerTaskManagerGame component now handles displaying the end screen UI itself.
  };

  return (
    // Apply a thematic background
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 p-4">
       {/* Use a container to constrain the width and center the game */}
      <div className="w-full max-w-6xl"> {/* Increased max-width for new layout */}
        <WorkerTaskManagerGame
          {...brickMakingScenario} // Spread the NEW scenario data
          onComplete={handleGameComplete}
        />
      </div>
    </div>
  );
};

export default DailyTaskManagerPage;
