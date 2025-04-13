import React from 'react';
import { GameResult, DailyGoal, GoalLabels } from '../types';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography
import SimpleButton from '@/components/ui/SimpleButton'; // Import SimpleButton

interface EndScreenProps {
    result: GameResult;
    dailyGoal: DailyGoal; // Needed to display target values
    goalLabels: GoalLabels; // Needed for display names
    onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ result, dailyGoal, goalLabels, onRestart }) => {
    return (
        // Use Container with default (dark) variant
        <Container
            variant="default"
            dir="rtl"
            className="flex flex-col items-center justify-center text-white p-8 text-center max-w-2xl mx-auto font-sans"
        >
            {/* Use Typography for title */}
            <Typography variant="h2" color="accent" className="mb-6 font-amatic">
                המשימה הסתיימה!
            </Typography>
            {/* Use Typography for result message */}
            {result.success ? (
                // Apply green text color directly using className, keep inherit color prop
                (<Typography variant="h3" color="inherit" className="mb-4 text-green-400">המכסה הושגה! עבודה טובה, מנהל!
                                    </Typography>)
            ) : (
                <Typography variant="h3" color="destructive" className="mb-4"> {/* Use h3 and destructive color */}
                    {'המכסה לא הושגה. הנוגשים לא יהיו מרוצים\'...'}
                </Typography>
            )}
            {/* Use Typography for summary section */}
            <Typography variant="body1" as="div" className="mb-6">
                <Typography variant="h4" as="h3" className="font-semibold mb-2 underline">סיכום יעדים:</Typography>
                {Object.entries(result.goalAchievement).map(([key, value]) => {
                    if (
                        key.endsWith("_progress") ||
                        key === "finalSharedResources" ||
                        key === "finalWorkers"
                    )
                        return null;
                    const goalKey = key;
                    const progressValue = result.goalAchievement[`${goalKey}_progress`];
                    const targetValue = dailyGoal[goalKey];
                    const label = goalLabels[goalKey] || goalKey;
                    return (
                        // Use Typography for each goal line
                        <Typography variant="body2" as="p" key={goalKey}>
                            {label}:{" "}
                            {typeof progressValue === "number"
                                ? `${progressValue} / ${targetValue}`
                                : progressValue}{" "}-{" "}
                            <span className={value ? "text-green-400" : "text-red-400"}>
                                {value ? "הושג" : "לא הושג"}
                            </span>
                        </Typography>
                    );
                })}
            </Typography>
            {/* Optional: Display final resources or worker states here if needed */}
            {/* <pre className="text-xs text-left">{JSON.stringify(result.finalSharedResources, null, 2)}</pre> */}
            {/* <pre className="text-xs text-left">{JSON.stringify(result.finalWorkers, null, 2)}</pre> */}
            {/* Use SimpleButton for restart */}
            <SimpleButton
                variant="bright" // Use bright blue variant
                onClick={onRestart}
                className="mt-6" // Keep margin
            >
                התחל מחדש
            </SimpleButton>
        </Container>
    );
};
