import React from 'react';
import { Typography } from '@/components/ui/Typography'; // Import Typography

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
            {/* Use Typography for label */}
            <Typography variant="small" as="span" className="flex items-center">
                <IconComponent size={12} className="mr-1" /> {label}
            </Typography>
            {/* Use Typography for value/max */}
            <Typography variant="small" as="span">
                {value.toFixed(0)} / {max}
            </Typography>
        </div>
        {/* Keep progress bar divs */}
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div
                className={`${getProgressBarColorFunc(value, max, lowerIsBetter)} h-2.5 rounded-full`}
                style={{ width: `${(value / max) * 100}%` }}
            ></div>
        </div>
    </div>
);
