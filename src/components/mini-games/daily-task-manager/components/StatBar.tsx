import React from 'react';
// Removed unused import: import { getProgressBarColor } from '../utils';

interface StatBarProps {
    label: string;
    value: number;
    max: number;
    IconComponent: React.ElementType;
    lowerIsBetter?: boolean;
    getProgressBarColorFunc: (value: number, max: number, lowerIsBetter?: boolean) => string; // Pass the function
}

export const StatBar: React.FC<StatBarProps> = ({
    label,
    value,
    max,
    IconComponent,
    lowerIsBetter = false,
    getProgressBarColorFunc,
}) => (
    <div>
        <div className="flex justify-between items-center mb-0.5">
            <span className="flex items-center"><IconComponent size={12} className="mr-1" /> {label}</span>
            <span>{value.toFixed(0)} / {max}</span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div
                className={`${getProgressBarColorFunc(value, max, lowerIsBetter)} h-2.5 rounded-full`}
                style={{ width: `${(value / max) * 100}%` }}
            ></div>
        </div>
    </div>
);
