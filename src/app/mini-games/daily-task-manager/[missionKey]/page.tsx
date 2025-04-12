"use client";

import React from 'react';
import { useParams } from 'next/navigation'; // Import useParams hook
import WorkerTaskManagerGame from '@/components/mini-games/daily-task-manager/WorkerTaskManagerGame';
import { gameScenarios } from '@/components/mini-games/daily-task-manager/taskSets'; // Import the scenarios map
import { GameResult } from '@/components/mini-games/daily-task-manager/types';

// Removed unused PageParams interface

const DynamicTaskManagerPage: React.FC = () => {
  const params = useParams();
  const missionKey = params?.missionKey as string | undefined; // Get missionKey from URL

  // Find the scenario based on the key
  const currentScenario = missionKey ? gameScenarios[missionKey] : undefined;

  const handleGameComplete = (result: GameResult) => {
    console.log(`Task Manager Game Completed (Mission: ${missionKey})!`);
    console.log(`Success: ${result.success}`);
    console.log(`Final Shared Resources:`, result.finalSharedResources); // Updated property name
    console.log(`Final Workers:`, result.finalWorkers);
    console.log(`Goal Achievement:`, result.goalAchievement);
  };

  // Handle case where missionKey is missing or invalid
  if (!currentScenario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">שגיאה: משימה לא נמצאה</h1>
          {/* Use template literal to avoid quote escaping issues */}
          <p>{`המשימה עם המפתח "${missionKey}" אינה קיימת.`}</p>
          {/* Optionally add a link back or to a list of missions */}
        </div>
      </div>
    );
  }

  // Render the game with the found scenario data
  return (
    <div
      className="flex items-center justify-center min-h-screen p-4" // Removed background Tailwind classes
      // Use the background image from the current scenario with explicit style properties
      style={{
        backgroundImage: `url(${currentScenario.backgroundImageUrl || '/images/daily_task_manager_bg.webp'})`, // Default fallback
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
       <div className="w-full max-w-6xl">
        <WorkerTaskManagerGame
          {...currentScenario} // Spread the found scenario data
          onComplete={handleGameComplete}
        />
      </div>
      {/* Removed extra closing div below */}
    </div>
  );
};

export default DynamicTaskManagerPage;
