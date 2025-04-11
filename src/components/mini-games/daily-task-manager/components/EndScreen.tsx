import React from 'react';
import { GameResult, DailyGoal, GoalLabels } from '../types';

interface EndScreenProps {
    result: GameResult;
    dailyGoal: DailyGoal; // Needed to display target values
    goalLabels: GoalLabels; // Needed for display names
    onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ result, dailyGoal, goalLabels, onRestart }) => {
    return (
        <div
            dir="rtl"
            className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/60 backdrop-blur-md border border-yellow-700 font-sans"
        >
            <h2 className="text-4xl font-bold mb-6 font-amatic text-yellow-400">
                המשימה הסתיימה!
            </h2>
            {result.success ? (
                <p className="text-2xl mb-4 text-green-400 font-sans">
                    המכסה הושגה! עבודה טובה, מנהל!
                </p>
            ) : (
                <p className="text-2xl mb-4 text-red-400 font-sans">
                    {'המכסה לא הושגה. הנוגשים לא יהיו מרוצים\'...'}
                </p>
            )}
            <div className="text-lg mb-6 font-sans">
                <h3 className="font-semibold mb-2 underline">סיכום יעדים:</h3>
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
                        <p key={goalKey}>
                            {label}:{" "}
                            {typeof progressValue === "number"
                                ? `${progressValue} / ${targetValue}`
                                : progressValue}{" "}
                            -{" "}
                            <span className={value ? "text-green-400" : "text-red-400"}>
                                {value ? "הושג" : "לא הושג"}
                            </span>
                        </p>
                    );
                })}
            </div>
            {/* Optional: Display final resources or worker states here if needed */}
            {/* <pre className="text-xs text-left">{JSON.stringify(result.finalSharedResources, null, 2)}</pre> */}
            {/* <pre className="text-xs text-left">{JSON.stringify(result.finalWorkers, null, 2)}</pre> */}
            <button
                onClick={onRestart} // Allow restarting
                className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition duration-300 shadow-md font-sans"
            >
                התחל מחדש
            </button>
        </div>
    );
};
