"use client"; // Required for hooks and client-side interactions

import React from 'react';
import DailyTaskManagerGame from '@/components/mini-games/daily-task-manager/DailyTaskManagerGame';
import { hardSlaveryScenario } from '@/components/mini-games/daily-task-manager/taskSets'; // Using one set for this standalone page
import { GameResult } from '@/components/mini-games/daily-task-manager/types'; // Import GameResult type

const DailyTaskManagerPage: React.FC = () => {
  // Dummy handler for when the game completes on this standalone page
  const handleGameComplete = (result: GameResult) => {
    console.log(`Standalone Daily Task Manager Game Completed!`);
    console.log(`Success: ${result.success}`);
    console.log(`Final Resources:`, result.finalResources);
    console.log(`Goal Achievement:`, result.goalAchievement);
    // The DailyTaskManagerGame component now handles displaying the end screen UI itself.
  };

  return (
    // Apply a thematic background
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 p-4">
       {/* Use a container to constrain the width and center the game */}
      <div className="w-full max-w-4xl">
        <DailyTaskManagerGame
          {...hardSlaveryScenario} // Spread the scenario data as props
          onComplete={handleGameComplete}
        />
      </div>
    </div>
  );
};

export default DailyTaskManagerPage;
