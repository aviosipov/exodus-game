import React from 'react';
import { DailyGoal, GoalLabels } from '../types';

interface GoalDisplayProps {
    dailyGoal: DailyGoal;
    goalProgress: DailyGoal;
    goalLabels: GoalLabels;
}

export const GoalDisplay: React.FC<GoalDisplayProps> = ({
    dailyGoal,
    goalProgress,
    goalLabels,
}) => {
    return (
        <div className="bg-black/40 p-3 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-yellow-500">
                מטרה יומית
            </h3>
            <div className="space-y-1 text-sm">
                {Object.entries(dailyGoal).map(([key, targetValue]) => (
                    <div key={key}>
                        <span>{goalLabels[key] || key}: </span>
                        {typeof targetValue === "number" ? (
                            <div className="w-full bg-gray-600 rounded-full h-4 relative">
                                <div
                                    className="bg-blue-500 h-4 rounded-full text-center text-xs text-white font-bold flex items-center justify-center"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (((goalProgress[key] as number) ?? 0) / targetValue) *
                                            100
                                        )}%`,
                                    }}
                                >
                                    {goalProgress[key] ?? 0} / {targetValue}
                                </div>
                            </div>
                        ) : (
                            <span className="font-bold">{goalProgress[key] ?? ""}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
