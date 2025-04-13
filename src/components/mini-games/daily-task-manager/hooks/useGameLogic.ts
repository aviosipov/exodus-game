import { useState, useEffect, useCallback, useRef, useMemo } from 'react'; // Added useMemo
import { Worker, Task, SharedResources, DailyGoal, GameResult, ResourceLabels } from '../types';
import { useWorkerManagement } from './useWorkerManagement';
import { useGameTimer } from './useGameTimer';

interface UseGameLogicParams {
    initialWorkers: Worker[];
    initialSharedResources: SharedResources;
    dailyGoal: DailyGoal;
    availableTasks: Task[];
    globalTimeLimit_seconds: number;
    sharedResourceLabels: ResourceLabels; // Needed for affordability checks
    onComplete: (result: GameResult) => void;
}

export const useGameLogic = ({
    initialWorkers,
    initialSharedResources,
    dailyGoal,
    availableTasks,
    globalTimeLimit_seconds,
    sharedResourceLabels,
    onComplete,
}: UseGameLogicParams) => {
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const [sharedResources, setSharedResources] = useState<SharedResources>(initialSharedResources);
    const [goalProgress, setGoalProgress] = useState<DailyGoal>(() => {
        const initialProgress: DailyGoal = {};
        Object.keys(dailyGoal).forEach(key => {
            initialProgress[key] = typeof dailyGoal[key] === 'number' ? 0 : '';
        });
        return initialProgress;
    });
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

    // Refs for latest state in callbacks
    const sharedResourcesRef = useRef(sharedResources);
    const goalProgressRef = useRef(goalProgress);
    useEffect(() => { sharedResourcesRef.current = sharedResources; }, [sharedResources]);
    useEffect(() => { goalProgressRef.current = goalProgress; }, [goalProgress]);


    // --- Child Hooks ---
    const {
        workers,
        // setWorkers, // Removed unused setter
        completeWorkerTask,
        startWorkerTaskTimer,
        clearAllWorkerTimeouts,
    } = useWorkerManagement({ initialWorkers, gameStarted, gameEnded, availableTasks, dailyGoal });

    const handleTimeEnd = useCallback(() => {
        // This function will be called by useGameTimer when time runs out
        if (!gameEnded) { // Prevent multiple calls
             setGameEnded(true);
        }
    }, [gameEnded]); // Dependency on gameEnded to prevent re-creation if it changes elsewhere

     const { globalTime /*, setGlobalTime */ } = useGameTimer({ // Removed unused setter
        timeLimitSeconds: globalTimeLimit_seconds,
        gameStarted,
        gameEnded,
        onTimeEnd: handleTimeEnd,
    });

     // --- Game State Management ---
    const startGame = useCallback(() => {
        setGameStarted(true);
        setGameEnded(false);
        // Reset states managed here
        setSharedResources(initialSharedResources);
        setGoalProgress(() => {
            const initialProgress: DailyGoal = {};
            Object.keys(dailyGoal).forEach(key => {
                initialProgress[key] = typeof dailyGoal[key] === 'number' ? 0 : '';
            });
            return initialProgress;
        });
        setSelectedWorkerId(null);
        setFeedbackMessage(null);
        // Timer and worker reset is handled within their respective hooks via gameStarted/gameEnded flags
    }, [initialSharedResources, dailyGoal]); // Dependencies for resetting - removed globalTimeLimit_seconds

    // --- Check Goal Met ---
    const checkGoalMet = useCallback((): GameResult => {
        let success = true;
        const achievement: { [key: string]: number | string | boolean } = {};

        for (const key in dailyGoal) {
            const target = dailyGoal[key];
            const current = goalProgressRef.current[key] ?? 0; // Use ref
            let achieved = false;

            if (typeof target === 'number') {
                achieved = (current as number) >= target;
            } else {
                achieved = current === target;
            }
            achievement[key] = achieved;
            if (!achieved) {
                success = false;
            }
        }
        Object.keys(goalProgressRef.current).forEach(key => {
            achievement[`${key}_progress`] = goalProgressRef.current[key];
        });

        return {
            success,
            finalSharedResources: sharedResourcesRef.current, // Use ref
            finalWorkers: workers, // Use current state from worker hook
            goalAchievement: achievement
        };
    }, [dailyGoal, workers]); // Depends on goal definition and final worker state

     // Effect to handle game ending logic (triggered by gameEnded state change)
    useEffect(() => {
        if (gameEnded) {
            clearAllWorkerTimeouts(); // Stop any ongoing tasks
            const result = checkGoalMet();
            onComplete(result); // Call the external completion callback
        }
    }, [gameEnded, clearAllWorkerTimeouts, checkGoalMet, onComplete]);


    // --- Task Affordability Check (delegates some checks) ---
    const canAffordTask = useCallback((task: Task, worker: Worker | undefined): { affordable: boolean; reason: string | null } => {
        if (!worker || worker.status !== 'idle') {
            return { affordable: false, reason: "עובד לא פנוי" };
        }
        // Check worker stats cost
        if (task.cost.energy && worker.energy < Math.abs(task.cost.energy)) {
            return { affordable: false, reason: `אין מספיק ${sharedResourceLabels['energy'] || 'אנרגיה'} לעובד` };
        }
        // Check shared resource costs (using current state)
        for (const key in task.cost) {
            if (key !== 'energy' && key !== 'hunger' && key !== 'morale') {
                const costValue = Math.abs(task.cost[key] ?? 0);
                if ((sharedResources[key] ?? 0) < costValue) {
                    return { affordable: false, reason: `אין מספיק ${sharedResourceLabels[key] || key}` };
                }
            }
        }
         // Check requirements
        if (task.requirements) {
            for (const key in task.requirements) {
                const requiredValue = task.requirements[key] ?? 0;
                // Check against shared resources OR goal progress if requirement is a goal key
                const currentValue = (key in dailyGoal)
                    ? (goalProgress[key] as number ?? 0)
                    : (sharedResources[key] ?? 0);

                if (currentValue < requiredValue) {
                    return { affordable: false, reason: `דרוש לפחות ${requiredValue} ${sharedResourceLabels[key] || key}` };
                }
            }
        }
        return { affordable: true, reason: null };
    }, [sharedResources, sharedResourceLabels, dailyGoal, goalProgress]); // Dependencies


    // --- Task Execution Orchestration ---
    const handlePerformTask = useCallback((task: Task) => {
        const worker = workers.find(w => w.id === selectedWorkerId);
        if (!worker || gameEnded) return;

        const affordCheck = canAffordTask(task, worker);
        if (!affordCheck.affordable) {
            setFeedbackMessage(affordCheck.reason || "לא ניתן לבצע משימה זו.");
            setTimeout(() => setFeedbackMessage(null), 2500);
            return;
        }

        setFeedbackMessage(null); // Clear feedback

        // Define the completion handler for this specific task instance
        const taskCompletionHandler = (completedWorkerId: string, completedTaskId: string) => {
             const { resourceUpdates, goalUpdates } = completeWorkerTask(completedWorkerId, completedTaskId);

             // Update shared resources based on results from worker hook
             setSharedResources(prev => {
                 const newState = { ...prev };
                 Object.entries(resourceUpdates).forEach(([key, change]) => {
                     newState[key] = (newState[key] || 0) + change;
                 });
                 return newState;
             });

             // Update goal progress based on results from worker hook
             setGoalProgress(prev => {
                 const newState = { ...prev };
                 Object.entries(goalUpdates).forEach(([key, value]) => {
                     if (typeof value === 'number') {
                         newState[key] = (newState[key] as number || 0) + value;
                     } else {
                         newState[key] = value; // For string-based goals if any
                     }
                 });
                 return newState;
              });

              // Provide user feedback
              const completedWorker = workers.find(w => w.id === completedWorkerId); // Use current workers state
              setFeedbackMessage(`${completedWorker?.name_he || 'עובד'}: ${task.name_he} - הושלמה!`);
              setTimeout(() => setFeedbackMessage(null), 2000);
         };

        // Start the timer and task state updates via the worker hook
        startWorkerTaskTimer(worker.id, task, taskCompletionHandler);

    }, [selectedWorkerId, workers, gameEnded, canAffordTask, completeWorkerTask, startWorkerTaskTimer]);

    // --- Filter Available Tasks based on context ---
    const filteredAvailableTasks = useMemo(() => {
        if (!selectedWorkerId) return availableTasks; // Return all if no worker selected

        // Check if any *other* worker is doing a resource-affecting task
        const isAnyOtherWorkerDoingResourceTask = workers.some(worker => {
            if (worker.id === selectedWorkerId || worker.status !== 'working' || !worker.currentTaskId) {
                return false;
            }
            const task = availableTasks.find(t => t.id === worker.currentTaskId);
            if (!task) return false;

            // Check if task affects shared resources (cost or outcome)
            const affectsResources = Object.keys(task.cost).some(key => !['energy', 'hunger', 'morale'].includes(key)) ||
                                    Object.keys(task.outcome).some(key => !['energy', 'hunger', 'morale'].includes(key) && !(key in dailyGoal));
            return affectsResources;
        });

        return availableTasks.filter(task => {
            if (task.id === 'help_friend') {
                return isAnyOtherWorkerDoingResourceTask; // Only show if condition met
            }
            return true; // Show all other tasks
        });
    }, [workers, selectedWorkerId, availableTasks, dailyGoal]);


    // --- Worker Selection ---
    const handleSelectWorker = useCallback((workerId: string) => {
        setSelectedWorkerId(prevId => (prevId === workerId ? null : workerId));
    }, []);


    return {
        gameStarted,
        gameEnded,
        globalTime,
        workers,
        sharedResources,
        goalProgress,
        selectedWorkerId,
        feedbackMessage,
        startGame,
        handleSelectWorker,
        canAffordTask,
        handlePerformTask,
        checkGoalMet, // Expose checkGoalMet
        filteredAvailableTasks, // Return the filtered list
        // Expose helper functions needed by UI components if utils.ts is not used
        // formatTime, getProgressBarColor, getWorkerStatusInfo etc.
    };
};
