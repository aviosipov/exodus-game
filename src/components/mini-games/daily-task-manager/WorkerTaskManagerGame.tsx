"use client";

import React from 'react';
import { WorkerTaskManagerProps, Worker, Task, ResourceLabels, GoalLabels } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import { WorkerList } from './components/WorkerList';
import { SelectedWorkerPanel } from './components/SelectedWorkerPanel';
import { ResourceDisplay } from './components/ResourceDisplay';
import { GoalDisplay } from './components/GoalDisplay';
import { TimerDisplay } from './components/TimerDisplay';
import { StartScreen } from './components/StartScreen';
import { EndScreen } from './components/EndScreen';
import { Zap, UtensilsCrossed, Smile, Frown, Apple, Bed, Hammer, LucideProps } from 'lucide-react'; // Keep icon imports here

// --- Helper Functions (Kept inline for now) ---

const getWorkerStatusInfo = (worker: Worker): { icon: React.ReactNode; color: string } => {
    const energyPercent = (worker.energy / worker.maxEnergy) * 100;
    const hungerPercent = (worker.hunger / worker.maxHunger) * 100;
    const moralePercent = (worker.morale / worker.maxMorale) * 100;
    let color = 'text-green-400';
    if (energyPercent < 30 || hungerPercent > 70 || moralePercent < 30) color = 'text-red-400';
    else if (energyPercent < 60 || hungerPercent > 40 || moralePercent < 60) color = 'text-yellow-400';
    let IconComponent: React.ComponentType<LucideProps> = Smile;
    switch (worker.status) {
        case 'working': IconComponent = Hammer; break;
        case 'resting': IconComponent = Bed; break;
        case 'eating': IconComponent = Apple; break;
        default:
            if (hungerPercent > 70) IconComponent = UtensilsCrossed;
            else if (energyPercent < 30) IconComponent = Zap;
            else if (moralePercent < 30) IconComponent = Frown;
            else IconComponent = Smile;
            break;
    }
    return { icon: <IconComponent size={16} className={`inline-block mr-1 ${color}`} />, color };
};

const getProgressBarColor = (value: number, max: number, lowerIsBetter = false): string => {
    const percent = (value / max) * 100;
    if (lowerIsBetter) {
        if (percent > 70) return 'bg-red-500';
        if (percent > 40) return 'bg-yellow-500';
        return 'bg-green-500';
    } else {
        if (percent < 30) return 'bg-red-500';
        if (percent < 60) return 'bg-yellow-500';
        return 'bg-green-500';
    }
};

const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const taskShortName = (taskId: string | null): string => {
    if (!taskId) return '';
    return taskId.split('_').slice(0, 2).join(' ');
};

const getCostOutcomeText = (task: Task, labels: ResourceLabels, goalLabels: GoalLabels): { costs: string[], outcomes: string[] } => {
    const costs: string[] = [];
    const outcomes: string[] = [];
    Object.entries(task.cost).forEach(([key, value]) => {
        if (value !== 0 && value !== undefined) costs.push(`${labels[key] || key}: ${value}`);
    });
    Object.entries(task.requirements || {}).forEach(([key, value]) => {
        if (value && value > 0) costs.push(`${labels[key] || key} דרוש: ${value}`);
    });
    Object.entries(task.outcome).forEach(([key, value]) => {
        if (value !== 0 && value !== undefined) {
            const label = labels[key] || goalLabels[key] || key;
            const displayValue = typeof value === 'number' ? (value > 0 ? `+${value}` : value) : value;
            outcomes.push(`${label}: ${displayValue}`);
        }
    });
    return { costs, outcomes };
};


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
                    getWorkerStatusInfo={getWorkerStatusInfo} // Pass helper
                    taskShortName={taskShortName} // Pass helper
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
                        getProgressBarColorFunc={getProgressBarColor} // Pass helper
                        getCostOutcomeTextFunc={getCostOutcomeText} // Pass helper
                    />
                )}
            </div>

            {/* Right Panel: Resources, Goal, Timer */}
            <div className="flex-grow space-y-4">
                <TimerDisplay
                    globalTime={globalTime}
                    formatTimeFunc={formatTime} // Pass helper
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
