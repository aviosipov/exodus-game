import React from 'react';
import { DailyGoal, GoalLabels } from '../types';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography

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
        // Use Container with default (dark) variant
        <Container variant="default" className="p-3">
            {/* Use Typography for title */}
            <Typography variant="h3" className="mb-2 text-yellow-500">
                מטרה יומית
            </Typography>
            <div className="space-y-1 text-sm">
                {Object.entries(dailyGoal).map(([key, targetValue]) => (
                    <div key={key}>
                        {/* Use Typography for label */}
                        <Typography variant="body2" as="span">
                            {goalLabels[key] || key}:{' '}
                        </Typography>
                        {typeof targetValue === "number" ? (
                            // Keep progress bar divs
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
                            // Use Typography for non-numeric goal
                            <Typography variant="body2" as="span" className="font-bold">
                                {goalProgress[key] ?? ""}
                            </Typography>
                        )}
                    </div>
                ))}
            </div>
        </Container>
    );
};
