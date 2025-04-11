import React from 'react';
// Removed unused import: import { formatTime } from '../utils';

interface TimerDisplayProps {
    globalTime: number;
    formatTimeFunc: (seconds: number) => string; // Pass the function
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    globalTime,
    formatTimeFunc,
}) => {
    return (
        <div className="bg-black/60 p-3 rounded border border-red-700 text-center">
            <h3 className="text-xl font-semibold text-red-400">זמן נותר</h3>
            <p className="text-4xl font-bold font-mono">
                {formatTimeFunc(globalTime)}
            </p>
        </div>
    );
};
