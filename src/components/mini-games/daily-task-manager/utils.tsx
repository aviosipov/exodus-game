import React from 'react';
import { Worker, Task, ResourceLabels, GoalLabels } from './types';
import { Zap, UtensilsCrossed, Smile, Frown, Apple, Bed, Hammer, LucideProps } from 'lucide-react'; // Import LucideProps for typing

// --- UI Helpers ---

// Helper to get worker status icon and color
export const getWorkerStatusInfo = (worker: Worker): { icon: React.ReactNode; color: string } => {
    const energyPercent = (worker.energy / worker.maxEnergy) * 100;
    const hungerPercent = (worker.hunger / worker.maxHunger) * 100; // Higher hunger is worse
    const moralePercent = (worker.morale / worker.maxMorale) * 100;

    let color = 'text-green-400'; // Default: Good
    if (energyPercent < 30 || hungerPercent > 70 || moralePercent < 30) {
        color = 'text-red-400'; // Critical
    } else if (energyPercent < 60 || hungerPercent > 40 || moralePercent < 60) {
        color = 'text-yellow-400'; // Warning
    }

    let IconComponent: React.ComponentType<LucideProps> = Smile; // Default icon component

    switch (worker.status) {
        case 'working':
            IconComponent = Hammer;
            break;
        case 'resting':
            IconComponent = Bed;
            break;
        case 'eating':
            IconComponent = Apple;
            break;
        case 'idle':
        default:
            // Show dominant need icon if idle
            if (hungerPercent > 70) {
                IconComponent = UtensilsCrossed;
            } else if (energyPercent < 30) {
                IconComponent = Zap;
            } else if (moralePercent < 30) {
                IconComponent = Frown;
            } else {
                IconComponent = Smile; // Idle and okay
            }
            break;
    }

    // Render the icon component with props
    const iconNode = <IconComponent size={16} className={`inline-block mr-1 ${color}`} />;

    return { icon: iconNode, color };
};

// Helper for progress bar color
export const getProgressBarColor = (value: number, max: number, lowerIsBetter = false): string => {
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

// Helper function to format time
export const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Helper to get short task name (if needed)
export const taskShortName = (taskId: string | null): string => {
    if (!taskId) return '';
    // Simple implementation: could fetch from availableTasks if needed
    return taskId.split('_').slice(0, 2).join(' ');
}

// Helper to get cost/outcome text data
export const getCostOutcomeText = (task: Task, labels: ResourceLabels, goalLabels: GoalLabels): { costs: string[], outcomes: string[] } => {
    const costs: string[] = [];
    const outcomes: string[] = [];

    Object.entries(task.cost).forEach(([key, value]) => {
        if (value !== 0 && value !== undefined) {
            costs.push(`${labels[key] || key}: ${value}`);
        }
    });
    Object.entries(task.requirements || {}).forEach(([key, value]) => {
        if (value && value > 0) {
            costs.push(`${labels[key] || key} דרוש: ${value}`);
        }
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
