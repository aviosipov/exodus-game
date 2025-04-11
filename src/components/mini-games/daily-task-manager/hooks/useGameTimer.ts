import { useState, useEffect, useRef } from 'react';

interface UseGameTimerParams {
    timeLimitSeconds: number;
    gameStarted: boolean;
    gameEnded: boolean;
    onTimeEnd: () => void;
}

export const useGameTimer = ({
    timeLimitSeconds,
    gameStarted,
    gameEnded,
    onTimeEnd,
}: UseGameTimerParams) => {
    const [globalTime, setGlobalTime] = useState<number>(timeLimitSeconds);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Reset timer when game restarts
        if (gameStarted && !gameEnded) {
            setGlobalTime(timeLimitSeconds);
        }
    }, [gameStarted, gameEnded, timeLimitSeconds]);

    useEffect(() => {
        if (!gameStarted || gameEnded || timerIntervalRef.current) {
            // Clear existing interval if game ends or hasn't started or interval already exists
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
            return;
        }

        // Start new interval only if game started, not ended, and no interval exists
        timerIntervalRef.current = setInterval(() => {
            setGlobalTime(prevTime => {
                if (prevTime <= 1) {
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                    onTimeEnd(); // Call the callback when time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup function
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [gameStarted, gameEnded, onTimeEnd]);

    return { globalTime, setGlobalTime }; // Return state and setter if needed externally
};
