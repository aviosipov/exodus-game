"use client"; // Required for hooks

import React, { useState, useEffect, useCallback } from 'react'; // Removed useMemo
import {
  DailyTaskManagerProps,
  Resources,
  DailyGoal,
  Task,
  GameResult,
} from './types';

const DailyTaskManagerGame: React.FC<DailyTaskManagerProps> = ({
  initialResources,
  resourceLabels,
  dailyGoal,
  goalLabels,
  availableTasks,
  onComplete,
  title_he,
}) => {
  const [currentResources, setCurrentResources] = useState<Resources>(initialResources);
  const [goalProgress, setGoalProgress] = useState<DailyGoal>(() => {
    // Initialize progress based on goal keys, starting at 0 or initial value if applicable
    const initialProgress: DailyGoal = {};
    Object.keys(dailyGoal).forEach(key => {
      initialProgress[key] = typeof dailyGoal[key] === 'number' ? 0 : ''; // Start numeric goals at 0
    });
    return initialProgress;
  });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [dayEnded, setDayEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [performingTask, setPerformingTask] = useState<{ id: string; progress: number } | null>(null); // State for active task
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null); // To store timeout ID

  // Check if a task can be afforded (Handles all resource types in cost)
  const canAffordTask = useCallback((task: Task): { affordable: boolean; missingResourceKey: string | null } => {
    for (const resourceKey in task.cost) {
      const costValue = Math.abs(task.cost[resourceKey] ?? 0);
      const currentVal = currentResources[resourceKey] ?? 0;
      if (currentVal < costValue) {
        return { affordable: false, missingResourceKey: resourceKey }; // Return the specific missing resource
      }
    }
    // Add requirement checks if implemented
    // for (const reqKey in task.requirements) { ... }
    return { affordable: true, missingResourceKey: null };
  }, [currentResources]);


  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  // Handle performing a task
  const handlePerformTask = useCallback((task: Task) => {
    const affordCheck = canAffordTask(task);
    // Prevent starting a new task if one is already performing, day ended, or cannot afford
    if (performingTask || dayEnded || !affordCheck.affordable) {
      if (!affordCheck.affordable) {
          const missingResourceLabel = resourceLabels[affordCheck.missingResourceKey ?? ''] || affordCheck.missingResourceKey || 'משאבים';
          setFeedbackMessage(`אין מספיק ${missingResourceLabel} למשימה זו.`);
          setTimeout(() => setFeedbackMessage(null), 2500);
      }
      return;
    }

    // --- Start Task Performance Simulation ---
    setPerformingTask({ id: task.id, progress: 0 }); // Mark task as performing
    setFeedbackMessage(null); // Clear previous feedback

    const timeCost = Math.abs(task.cost.time ?? 1); // Get time cost (default 1 if not specified)
    const duration = timeCost * 500; // Simulate duration (e.g., 0.5 seconds per time unit)
    const startTime = Date.now(); // Changed to const

    // Use interval for smooth progress update (optional but nice)
    const intervalId = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(100, Math.floor((elapsedTime / duration) * 100));
        setPerformingTask({ id: task.id, progress: progress });
    }, 50); // Update progress frequently

    // Set timeout for task completion
    const newTimeoutId = setTimeout(() => {
      clearInterval(intervalId); // Stop progress updates

      // --- Apply Task Costs and Outcomes (AFTER duration) ---
      setCurrentResources(prevResources => {
      const newResources = { ...prevResources };
      // Apply costs (including materials, morale etc.)
      for (const key in task.cost) {
        newResources[key] = (newResources[key] ?? 0) + (task.cost[key] ?? 0);
      }
      // Apply resource outcomes (including materials, morale etc.)
      for (const key in task.outcome) {
        // Check if the outcome key exists in initialResources OR is a known goal key
        // This allows adding new resources/goals via outcome even if not initially present
        if (Object.prototype.hasOwnProperty.call(initialResources, key) || Object.prototype.hasOwnProperty.call(dailyGoal, key)) {
           // Prioritize updating if it's a resource
           if (Object.prototype.hasOwnProperty.call(newResources, key)) {
                if (typeof task.outcome[key] === 'number') {
                    newResources[key] = (newResources[key] ?? 0) + (task.outcome[key] as number ?? 0);
                }
                // Add handling for other types if needed (e.g., string for status)
           }
           // Note: Goal progress is handled separately below
        }
      }
      return newResources;
    });

    setGoalProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      // Apply goal outcomes
      for (const key in task.outcome) {
        if (key in dailyGoal) { // Only update if it's a goal
          if (typeof dailyGoal[key] === 'number') {
             newProgress[key] = (newProgress[key] as number ?? 0) + (task.outcome[key] as number ?? 0);
           } else if (typeof task.outcome[key] === 'string') {
             // Handle non-numeric goals (ensure it's a string)
             newProgress[key] = task.outcome[key];
           }
           // If outcome[key] is neither number nor string for a goal, it's ignored here.
           // Add more specific handling if other types are expected for goals.
         }
      }
      return newProgress;
    });

      setFeedbackMessage("משימה בוצעה בהצלחה!");
      setTimeout(() => setFeedbackMessage(null), 1500);
      setPerformingTask(null); // Mark task as completed
      setTimeoutId(null); // Clear stored timeout ID

    }, duration); // End timeout after calculated duration

    setTimeoutId(newTimeoutId); // Store the timeout ID

  }, [dayEnded, canAffordTask, dailyGoal, setCurrentResources, setGoalProgress, performingTask, resourceLabels, initialResources, timeoutId]); // Added performingTask, resourceLabels, initialResources, timeoutId

  // Check if the daily goal is met
  const checkGoalMet = useCallback((): GameResult => {
    let success = true;
    const achievement: { [key: string]: number | string | boolean } = {};

    for (const key in dailyGoal) {
      const target = dailyGoal[key];
      const current = goalProgress[key] ?? 0;
      let achieved = false;

      if (typeof target === 'number') {
        achieved = (current as number) >= target;
      } else {
        // Basic string comparison for non-numeric goals
        achieved = current === target;
      }
      achievement[key] = achieved; // Store boolean achievement status
      if (!achieved) {
        success = false;
      }
    }
       // Add final progress and resource state to achievement details
       Object.keys(goalProgress).forEach(key => {
        achievement[`${key}_progress`] = goalProgress[key];
    });
    // Removed: achievement['final_resources'] = currentResources; // This was incorrect


    return { success, finalResources: currentResources, goalAchievement: achievement };
  }, [dailyGoal, goalProgress, currentResources]);

  // Handle ending the day
  const handleEndDay = useCallback(() => {
    if (dayEnded) return;
    setDayEnded(true);
    const result = checkGoalMet();
    onComplete(result); // Trigger callback with result
    // Feedback based on result will be shown in the end screen
  }, [dayEnded, checkGoalMet, onComplete]);

  // Automatically end day if a key resource (e.g., time or energy) runs out
  useEffect(() => {
    if (!dayEnded) {
      // Define which resources ending the day (e.g., time <= 0)
      const criticalResources = ['time', 'energy'];
      const shouldEnd = criticalResources.some(key => (currentResources[key] ?? 0) <= 0);
      if (shouldEnd) {
        setFeedbackMessage("הזמן או האנרגיה אזלו! היום הסתיים.");
        setTimeout(handleEndDay, 1500); // Give feedback time before ending
      }
    }
  }, [currentResources, dayEnded, handleEndDay]);

  // Start Game Logic
  const startGame = () => {
    setGameStarted(true);
    // Reset state if needed for replayability (not implemented yet)
    // setCurrentResources(initialResources);
    // setGoalProgress(...);
    // setDayEnded(false);
  };

  // --- Rendering ---

  // Start Screen
  if (!gameStarted) {
    return (
      // Added font-sans as base
      <div dir="rtl" className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/60 backdrop-blur-md border border-yellow-700 font-sans">
        {title_he && (
          <h2 className="text-4xl font-bold mb-6 font-amatic text-yellow-400">{title_he}</h2> // Changed to font-amatic
        )}
        <p className="text-xl mb-8 font-sans">מוכן להתחיל את אתגר ניהול המשימות היומי?</p>
        <button
          onClick={startGame}
          className="px-10 py-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition duration-300 text-xl shadow-md hover:shadow-lg transform hover:scale-105 font-sans"
        >
          התחל יום
        </button>
      </div>
    );
  }

  // End Screen (Shown after onComplete is called)
  if (dayEnded) {
     const result = checkGoalMet(); // Recalculate for display
    return (
      // Added font-sans as base
      <div dir="rtl" className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/60 backdrop-blur-md border border-yellow-700 font-sans">
        <h2 className="text-4xl font-bold mb-6 font-amatic text-yellow-400">היום הסתיים!</h2>
        {result.success ? (
           <p className="text-2xl mb-4 text-green-400 font-sans">המכסה הושגה! ניהול יעיל!</p> // Updated success message
        ) : (
           <p className="text-2xl mb-4 text-red-400 font-sans">המכסה לא הושגה הפעם.</p> // Updated failure message
        )}
         <div className="text-lg mb-6 font-sans">
            <h3 className="font-semibold mb-2 underline">סיכום:</h3>
            {Object.entries(result.goalAchievement).map(([key, value]) => {
                 if (key.endsWith('_progress') || key === 'final_resources') return null; // Skip helper keys
                 const goalKey = key;
                 const progressValue = result.goalAchievement[`${goalKey}_progress`];
                 const targetValue = dailyGoal[goalKey];
                 const label = goalLabels[goalKey] || goalKey;
                 return (
                    <p key={goalKey}>
                        {label}: {typeof progressValue === 'number' ? `${progressValue} / ${targetValue}` : progressValue} - {value ? 'הושג' : 'לא הושג'}
                    </p>
                 );
            })}
         </div>
        {/* Optional: Add button to proceed or restart */}
      </div>
    );
  }

  // Main Game Screen
  return (
    // Added font-sans as base
    <div dir="rtl" className="p-4 md:p-6 max-w-4xl w-full mx-auto text-white bg-black/50 backdrop-blur-sm rounded-lg border border-yellow-800 shadow-xl font-sans">
      {/* Header */}
      {title_he && (
         <>
            <h2 className="text-3xl font-bold mb-2 text-center font-amatic text-yellow-400">{title_he}</h2>
            <p className="text-center text-sm text-yellow-200 mb-4">נהל את משאבי הצוות שלך ועמוד במכסה היומית.</p> {/* Added narrative intro */}
         </>
      )}

      {/* Resources and Goals Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Resources Display - Iterates over initialResources to show all */}
        <div className="bg-black/40 p-4 rounded border border-gray-600 font-sans">
          <h3 className="text-xl font-semibold mb-2 text-yellow-500">משאבים</h3>
          {Object.keys(initialResources).map((key) => ( // Iterate over initial keys to ensure all are shown
            <div key={key} className="flex justify-between items-center mb-1">
              <span>{resourceLabels[key] || key}:</span>
              <span className="font-bold">{currentResources[key] ?? 0}</span> {/* Show current value, default 0 */}
            </div>
          ))}
        </div>

        {/* Goals */}
        <div className="bg-black/40 p-4 rounded border border-gray-600 font-sans">
          <h3 className="text-xl font-semibold mb-2 text-yellow-500">מטרות יומיות</h3>
          {Object.entries(dailyGoal).map(([key, targetValue]) => (
            <div key={key} className="flex justify-between items-center mb-1">
              <span>{goalLabels[key] || key}:</span>
              {/* Basic text display, could be replaced with progress bars */}
              <span className="font-bold">
                {typeof targetValue === 'number'
                  ? `${goalProgress[key] ?? 0} / ${targetValue}`
                  : `${goalProgress[key] ?? ''}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="mb-6 font-sans">
        <h3 className="text-xl font-semibold mb-3 text-yellow-500">משימות זמינות</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTasks.map((task) => {
            const affordCheck = canAffordTask(task); // Use the object result
            const affordable = affordCheck.affordable;
            return (
              <div key={task.id} className={`p-4 rounded border ${affordable ? 'border-yellow-700 bg-black/30' : 'border-gray-600 bg-black/20 opacity-60'} font-sans flex flex-col justify-between`}>
                <div> {/* Wrap content to push button down */}
                    <h4 className="text-lg font-semibold mb-2 text-yellow-300">{task.name_he}</h4>
                    {task.description_he && <p className="text-sm mb-2 text-gray-300">{task.description_he}</p>}
                    <div className="text-xs mb-2"> {/* Smaller text for cost/outcome */}
                      <p className="font-medium text-red-400">עלות:</p>
                      {Object.entries(task.cost).map(([key, value]) => (
                        <span key={key} className="inline-block mr-2">{resourceLabels[key] || key}: {value}</span> // Use inline-block
                      ))}
                    </div>
                    <div className="text-xs mb-3"> {/* Smaller text for cost/outcome */}
                      <p className="font-medium text-green-400">תוצאה:</p>
                      {Object.entries(task.outcome).map(([key, value]) => {
                         // Check if value is a number before formatting with +/-
                         const displayValue = typeof value === 'number'
                           ? (value > 0 ? `+${value}` : value)
                           : value; // Display non-numbers as is (or handle differently if needed)
                         return (
                           <span key={key} className="inline-block mr-2"> {/* Use inline-block */}
                              {(resourceLabels[key] || goalLabels[key] || key)}: {displayValue}
                           </span>
                         );
                      })}
                    </div>
                </div>
                <button
                  onClick={() => handlePerformTask(task)}
                  disabled={!affordable || dayEnded || !!performingTask} // Disable if any task is performing
                  className={`w-full mt-auto px-3 py-1.5 rounded font-bold text-black transition duration-200 text-sm ${
                    affordable && !performingTask // Only style as active if affordable AND no task is running
                      ? 'bg-yellow-500 hover:bg-yellow-400'
                      : 'bg-gray-500 cursor-not-allowed'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  בצע
                </button>
                {/* Progress Bar Display */}
                {performingTask && performingTask.id === task.id && (
                  <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full transition-width duration-100 ease-linear"
                      style={{ width: `${performingTask.progress}%` }}
                    ></div>
                     <p className="text-xs text-center text-yellow-200 mt-1">בעבודה...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

       {/* Feedback Area */}
      {feedbackMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded shadow-lg z-50 animate-pulse">
          {feedbackMessage}
        </div>
      )}


      {/* End Day Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleEndDay}
          disabled={dayEnded || !!performingTask} // Disable if task is running
          className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-sans"
        >
          סיים יום
        </button>
      </div>
    </div>
  );
};

export default DailyTaskManagerGame;
