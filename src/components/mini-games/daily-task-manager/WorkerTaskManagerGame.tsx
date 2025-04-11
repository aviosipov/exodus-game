"use client";

import React from 'react';
import { WorkerTaskManagerProps } from './types'; // Removed unused Worker, Task, ResourceLabels, GoalLabels
import { useGameLogic } from './hooks/useGameLogic';
import { WorkerList } from './components/WorkerList';
import { SelectedWorkerPanel } from './components/SelectedWorkerPanel';
import { ResourceDisplay } from './components/ResourceDisplay';
import { GoalDisplay } from './components/GoalDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { StartScreen } from './components/StartScreen';
import { EndScreen } from './components/EndScreen';
// Removed unused icon imports: Zap, UtensilsCrossed, Smile, Frown, Apple, Bed, Hammer
// Import helpers from utils.tsx
import {
    getWorkerStatusInfo,
    getProgressBarColor,
    formatTime,
    taskShortName,
    getCostOutcomeText
} from './utils';


// --- Helper Functions (Removed from inline) ---
// Definitions are now in utils.tsx


// --- Main Component ---

const WorkerTaskManagerGame: React.FC<WorkerTaskManagerProps> = (props) => {
    const {
        initialWorkers,
        initialSharedResources,
        sharedResourceLabels,
        dailyGoal,
        goalLabels,
        availableTasks,
        globalTimeLimit_seconds,
        onComplete,
        title_he,
    } = props;

    const {
        gameStarted,
        gameEnded,
        globalTime,
        workers,
        sharedResources,
        goalProgress,
        selectedWorkerId,
        feedbackMessage,
        startGame,
        handleSelectWorker,
        canAffordTask,
        handlePerformTask,
        checkGoalMet, // Destructure checkGoalMet
    } = useGameLogic({
        initialWorkers,
        initialSharedResources,
        dailyGoal,
        availableTasks,
        globalTimeLimit_seconds,
        sharedResourceLabels,
        onComplete,
    });

    const selectedWorker = workers.find(w => w.id === selectedWorkerId);

    // --- Rendering Logic ---

    if (!gameStarted) {
        return <StartScreen title_he={title_he} onStartGame={startGame} />;
    }

    if (gameEnded) {
        // Recalculate result for display consistency when game ends
        const result = checkGoalMet();
        return <EndScreen result={result} dailyGoal={dailyGoal} goalLabels={goalLabels} onRestart={startGame} />;
    }

    // Main Game Screen
    return (
        <div
            dir="rtl"
            className="p-4 md:p-6 max-w-6xl w-full mx-auto text-white bg-black/50 backdrop-blur-sm rounded-lg border border-yellow-800 shadow-xl font-sans flex flex-col md:flex-row gap-4"
        >
            {/* Left Panel: Workers & Selected Worker */}
            <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
                <WorkerList
                    workers={workers}
                    selectedWorkerId={selectedWorkerId}
                    onSelectWorker={handleSelectWorker}
                    getWorkerStatusInfo={getWorkerStatusInfo} // Now imported
                    taskShortName={taskShortName} // Now imported
                />

                {selectedWorker && (
                    <SelectedWorkerPanel
                        selectedWorker={selectedWorker}
                        availableTasks={availableTasks}
                        sharedResourceLabels={sharedResourceLabels}
                        goalLabels={goalLabels}
                        gameEnded={gameEnded}
                        canAffordTask={(task, worker) => canAffordTask(task, worker)} // Pass down affordability check
                        onPerformTask={handlePerformTask}
                        getProgressBarColorFunc={getProgressBarColor} // Now imported
                        getCostOutcomeTextFunc={getCostOutcomeText} // Now imported
                    />
                )}
            </div>

            {/* Right Panel: Resources, Goal, Timer */}
            <div className="flex-grow space-y-4">
                <TimerDisplay
                    globalTime={globalTime}
                    formatTimeFunc={formatTime} // Now imported
                />
                <ResourceDisplay
                    sharedResources={sharedResources}
                    resourceLabels={sharedResourceLabels}
                />
                <GoalDisplay
                    dailyGoal={dailyGoal}
                    goalProgress={goalProgress}
                    goalLabels={goalLabels}
                />
            </div>

            {/* Feedback Area */}
            {feedbackMessage && (
                <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded shadow-lg z-50 animate-pulse">
                    {feedbackMessage}
                </div>
            )}
        </div>
    );
};

export default WorkerTaskManagerGame;
