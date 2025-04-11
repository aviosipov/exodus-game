import { useState, useEffect, useCallback, useRef } from 'react';
import { Worker, Task, DailyGoal } from '../types';

interface UseWorkerManagementParams {
    initialWorkers: Worker[];
    gameStarted: boolean;
    gameEnded: boolean;
    availableTasks: Task[];
    dailyGoal: DailyGoal; // Needed for task outcome checks
}

export const useWorkerManagement = ({
    initialWorkers,
    gameStarted,
    gameEnded,
    availableTasks,
    dailyGoal, // Receive dailyGoal
}: UseWorkerManagementParams) => {
    const [workers, setWorkers] = useState<Worker[]>(
        initialWorkers.map(w => ({ ...w, taskTimeoutId: null, taskProgress: 0 }))
    );
    const workersRef = useRef(workers); // Ref for accessing latest state in callbacks

    useEffect(() => {
        workersRef.current = workers;
    }, [workers]);

    // Reset workers when game restarts
    useEffect(() => {
        if (gameStarted && !gameEnded) {
            setWorkers(initialWorkers.map(w => ({ ...w, taskTimeoutId: null, taskProgress: 0 })));
        }
    }, [gameStarted, gameEnded, initialWorkers]);


    // Basic needs depletion effect
    useEffect(() => {
        if (!gameStarted || gameEnded) return;

        const needsInterval = setInterval(() => {
            setWorkers(currentWorkers => currentWorkers.map(w => ({
                ...w,
                // Increase hunger slightly only if idle, resting, or eating (not while working hard)
                hunger: (w.status !== 'working')
                    ? Math.min(w.maxHunger, w.hunger + 0.1)
                    : w.hunger,
                // Optional: Morale decay?
            })));
        }, 5000); // Deplete needs every 5 seconds

        return () => clearInterval(needsInterval);
    }, [gameStarted, gameEnded]);

    // Function to update a worker's state (used by task completion)
    const updateWorkerState = useCallback((workerId: string, updates: Partial<Worker>) => {
        setWorkers(prevWorkers =>
            prevWorkers.map(w => (w.id === workerId ? { ...w, ...updates } : w))
        );
    }, []);

    // Function to handle task completion effects on a worker
    const completeWorkerTask = useCallback((workerId: string, taskId: string) => {
        const task = availableTasks.find(t => t.id === taskId);
        const worker = workersRef.current.find(w => w.id === workerId); // Use ref

        if (!task || !worker) return { workerUpdates: {}, resourceUpdates: {}, goalUpdates: {} };

        // Calculate new worker stats based on cost and outcome
        let newEnergy = worker.energy + (task.cost.energy ?? 0) + (task.outcome.energy ?? 0);
        let newHunger = worker.hunger + (task.cost.hunger ?? 0) + (task.outcome.hunger ?? 0);
        let newMorale = worker.morale + (task.cost.morale ?? 0) + (task.outcome.morale ?? 0);

        // Clamp values
        newEnergy = Math.max(0, Math.min(worker.maxEnergy, newEnergy));
        newHunger = Math.max(0, Math.min(worker.maxHunger, newHunger));
        newMorale = Math.max(0, Math.min(worker.maxMorale, newMorale));

        const workerUpdates: Partial<Worker> = {
            energy: newEnergy,
            hunger: newHunger,
            morale: newMorale,
            status: 'idle',
            currentTaskId: null,
            taskProgress: 0,
            taskTimeoutId: null,
        };

        // Determine resource and goal updates separately
        const resourceUpdates: { [key: string]: number } = {};
        const goalUpdates: { [key: string]: number | string } = {};

        // Apply material costs
        for (const key in task.cost) {
            if (key !== 'energy' && key !== 'hunger' && key !== 'morale') {
                resourceUpdates[key] = (resourceUpdates[key] || 0) - Math.abs(task.cost[key] ?? 0);
            }
        }
        // Apply material/goal outcomes
        for (const key in task.outcome) {
            if (key !== 'energy' && key !== 'hunger' && key !== 'morale') {
                if (key in dailyGoal) {
                    // It's a goal outcome
                    if (typeof dailyGoal[key] === 'number' && typeof task.outcome[key] === 'number') {
                         goalUpdates[key] = (task.outcome[key] as number ?? 0); // Store the change amount
                    } else if (typeof task.outcome[key] === 'string') {
                         goalUpdates[key] = task.outcome[key] as string; // Store the string value
                    }
                } else {
                    // It's a shared resource outcome
                     if (typeof task.outcome[key] === 'number') {
                        resourceUpdates[key] = (resourceUpdates[key] || 0) + (task.outcome[key] as number ?? 0);
                     }
                }
            }
        }

        // Update the worker's state via the state setter
        updateWorkerState(workerId, workerUpdates);

        // Return updates for other states
        return { resourceUpdates, goalUpdates };

    }, [availableTasks, dailyGoal, updateWorkerState]); // Include dailyGoal

    // Function to start a task timer for a worker
    const startWorkerTaskTimer = useCallback((workerId: string, task: Task, onComplete: (workerId: string, taskId: string) => void) => {
        const durationMillis = task.duration_seconds * 1000;
        let progressInterval: NodeJS.Timeout | null = null;

        // Clear previous timeouts just in case
        setWorkers(prevWorkers => prevWorkers.map(w => {
            if (w.id === workerId && w.taskTimeoutId) {
                clearTimeout(w.taskTimeoutId);
            }
            return w.id === workerId ? { ...w, status: 'working', currentTaskId: task.id, taskProgress: 0, taskTimeoutId: null } : w;
        }));


        // Optional: Progress update interval
        if (durationMillis > 100) {
            progressInterval = setInterval(() => {
                setWorkers(currentWorkers => currentWorkers.map(w => {
                    if (w.id === workerId && w.status === 'working') {
                        const currentProgress = w.taskProgress ?? 0;
                        // More robust progress calculation needed if precise visual feedback is critical
                        const increment = (100 / (durationMillis / 50)); // Progress per 50ms interval
                        const newProgress = Math.min(100, currentProgress + increment);
                        return { ...w, taskProgress: newProgress };
                    }
                    return w;
                }));
            }, 50);
        }

        const taskTimeout = setTimeout(() => {
            if (progressInterval) clearInterval(progressInterval);
            onComplete(workerId, task.id); // Call the provided completion handler
        }, durationMillis);

        // Store the timeout ID and clear progress interval ID on the worker
        setWorkers(prevWorkers => prevWorkers.map(w =>
            w.id === workerId ? { ...w, taskTimeoutId: taskTimeout } : w
        ));

        // Return cleanup function for the progress interval
        return () => {
             if (progressInterval) clearInterval(progressInterval);
             // Timeout is cleared via onComplete or game end logic
        };

    }, []);

    // Function to clear all active task timeouts (e.g., on game end)
    const clearAllWorkerTimeouts = useCallback(() => {
        workersRef.current.forEach(worker => {
            if (worker.taskTimeoutId) {
                clearTimeout(worker.taskTimeoutId);
                // Optionally reset worker status if needed upon abrupt end
                 updateWorkerState(worker.id, { status: 'idle', currentTaskId: null, taskProgress: 0, taskTimeoutId: null });
            }
        });
    }, [updateWorkerState]);


    return {
        workers,
        setWorkers, // Expose if direct manipulation is needed (less ideal)
        updateWorkerState,
        completeWorkerTask,
        startWorkerTaskTimer,
        clearAllWorkerTimeouts,
    };
};
