"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  WorkerTaskManagerProps,
  Worker,
  SharedResources,
  Task,
  GameResult,
  DailyGoal,
  ResourceLabels, // Added import
  GoalLabels, // Added import
} from "./types";
import {
  Zap,
  UtensilsCrossed,
  Smile,
  Frown,
  Apple,
  Bed,
  Hammer,
  Info,
} from "lucide-react"; // Import icons (Removed Meh, Wheat, Brick)

// Helper to get worker status icon and color
const getWorkerStatusInfo = (
  worker: Worker
): { icon: React.ReactNode; color: string } => {
  const energyPercent = (worker.energy / worker.maxEnergy) * 100;
  const hungerPercent = (worker.hunger / worker.maxHunger) * 100; // Higher hunger is worse
  const moralePercent = (worker.morale / worker.maxMorale) * 100;

  let color = "text-green-400"; // Default: Good
  if (energyPercent < 30 || hungerPercent > 70 || moralePercent < 30) {
    color = "text-red-400"; // Critical
  } else if (energyPercent < 60 || hungerPercent > 40 || moralePercent < 60) {
    color = "text-yellow-400"; // Warning
  }

  switch (worker.status) {
    case "working":
      return {
        icon: <Hammer size={16} className={`inline-block mr-1 ${color}`} />,
        color,
      };
    case "resting":
      return {
        icon: <Bed size={16} className={`inline-block mr-1 ${color}`} />,
        color,
      };
    case "eating":
      return {
        icon: <Apple size={16} className={`inline-block mr-1 ${color}`} />,
        color,
      };
    case "idle":
    default:
      // Show dominant need icon if idle
      if (hungerPercent > 70)
        return {
          icon: (
            <UtensilsCrossed
              size={16}
              className={`inline-block mr-1 ${color}`}
            />
          ),
          color,
        };
      if (energyPercent < 30)
        return {
          icon: <Zap size={16} className={`inline-block mr-1 ${color}`} />,
          color,
        };
      if (moralePercent < 30)
        return {
          icon: <Frown size={16} className={`inline-block mr-1 ${color}`} />,
          color,
        };
      return {
        icon: <Smile size={16} className={`inline-block mr-1 ${color}`} />,
        color,
      }; // Idle and okay
  }
};

// Helper for progress bar color
const getProgressBarColor = (
  value: number,
  max: number,
  lowerIsBetter = false
): string => {
  const percent = (value / max) * 100;
  if (lowerIsBetter) {
    if (percent > 70) return "bg-red-500";
    if (percent > 40) return "bg-yellow-500";
    return "bg-green-500";
  } else {
    if (percent < 30) return "bg-red-500";
    if (percent < 60) return "bg-yellow-500";
    return "bg-green-500";
  }
};

const WorkerTaskManagerGame: React.FC<WorkerTaskManagerProps> = ({
  initialWorkers,
  initialSharedResources,
  sharedResourceLabels,
  dailyGoal,
  goalLabels,
  availableTasks,
  globalTimeLimit_seconds,
  onComplete,
  title_he,
}) => {
  const [workers, setWorkers] = useState<Worker[]>(
    initialWorkers.map((w) => ({ ...w, taskTimeoutId: null, taskProgress: 0 }))
  ); // Ensure initial state is clean
  const [sharedResources, setSharedResources] = useState<SharedResources>(
    initialSharedResources
  );
  const [goalProgress, setGoalProgress] = useState<DailyGoal>(() => {
    const initialProgress: DailyGoal = {};
    Object.keys(dailyGoal).forEach((key) => {
      initialProgress[key] = typeof dailyGoal[key] === "number" ? 0 : "";
    });
    return initialProgress;
  });
  const [globalTime, setGlobalTime] = useState<number>(globalTimeLimit_seconds);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Refs to store latest state for callbacks that might close over stale state
  const workersRef = useRef(workers);
  const sharedResourcesRef = useRef(sharedResources);
  const goalProgressRef = useRef(goalProgress);

  useEffect(() => {
    workersRef.current = workers;
  }, [workers]);
  useEffect(() => {
    sharedResourcesRef.current = sharedResources;
  }, [sharedResources]);
  useEffect(() => {
    goalProgressRef.current = goalProgress;
  }, [goalProgress]);

  // --- Game Timer and Needs Depletion ---
  useEffect(() => {
    if (!gameStarted || gameEnded) return;

    const timerInterval = setInterval(() => {
      setGlobalTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerInterval);
          handleEndGame(); // End game when time runs out
          return 0;
        }
        return prevTime - 1;
      });

      // Basic needs depletion (e.g., hunger increases slightly over time)
      setWorkers((currentWorkers) =>
        currentWorkers.map((w) => ({
          ...w,
          hunger: Math.min(w.maxHunger, w.hunger + 0.1), // Small constant hunger increase
          // Morale might decrease slightly if idle and hungry/tired? (optional complexity)
        }))
      );
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameStarted, gameEnded]);

  // --- Task Affordability Check ---
  const canAffordTask = useCallback(
    (
      task: Task,
      worker: Worker | undefined
    ): { affordable: boolean; reason: string | null } => {
      if (!worker || worker.status !== "idle") {
        return { affordable: false, reason: "עובד לא פנוי" };
      }

      // Check worker stats cost (e.g., enough energy)
      if (task.cost.energy && worker.energy < Math.abs(task.cost.energy)) {
        return {
          affordable: false,
          reason: `אין מספיק ${
            sharedResourceLabels["energy"] || "אנרגיה"
          } לעובד`,
        };
      }

      // Check shared resource costs
      for (const key in task.cost) {
        if (key !== "energy" && key !== "hunger" && key !== "morale") {
          // Check only material costs
          const costValue = Math.abs(task.cost[key] ?? 0);
          if ((sharedResources[key] ?? 0) < costValue) {
            return {
              affordable: false,
              reason: `אין מספיק ${sharedResourceLabels[key] || key}`,
            };
          }
        }
      }

      // Check requirements
      if (task.requirements) {
        for (const key in task.requirements) {
          const requiredValue = task.requirements[key] ?? 0;
          if ((sharedResources[key] ?? 0) < requiredValue) {
            return {
              affordable: false,
              reason: `דרוש לפחות ${requiredValue} ${
                sharedResourceLabels[key] || key
              }`,
            };
          }
        }
      }

      return { affordable: true, reason: null };
    },
    [sharedResources, sharedResourceLabels]
  );

  // --- Task Completion Logic ---
  const completeTask = useCallback(
    (workerId: string, taskId: string) => {
      const task = availableTasks.find((t) => t.id === taskId);
      if (!task) return;

      // Use refs to get the latest state inside the timeout callback
      const currentWorkers = workersRef.current;
      // Removed unused reads for sharedResourcesRef and goalProgressRef

      const workerIndex = currentWorkers.findIndex((w) => w.id === workerId);
      if (workerIndex === -1) return; // Worker not found

      const worker = currentWorkers[workerIndex];

      // Calculate new worker stats
      let newEnergy =
        worker.energy + (task.cost.energy ?? 0) + (task.outcome.energy ?? 0); // Apply cost(-) and outcome(+)
      let newHunger =
        worker.hunger + (task.cost.hunger ?? 0) + (task.outcome.hunger ?? 0); // Apply cost(+) and outcome(-)
      let newMorale =
        worker.morale + (task.cost.morale ?? 0) + (task.outcome.morale ?? 0); // Apply cost/outcome

      // Clamp values
      newEnergy = Math.max(0, Math.min(worker.maxEnergy, newEnergy));
      newHunger = Math.max(0, Math.min(worker.maxHunger, newHunger));
      newMorale = Math.max(0, Math.min(worker.maxMorale, newMorale));

      // Update worker state directly in the main state update
      setWorkers((prevWorkers) => {
        const updatedWorkers = [...prevWorkers];
        const idx = updatedWorkers.findIndex((w) => w.id === workerId);
        if (idx !== -1) {
          updatedWorkers[idx] = {
            ...updatedWorkers[idx],
            energy: newEnergy,
            hunger: newHunger,
            morale: newMorale,
            status: "idle",
            currentTaskId: null,
            taskProgress: 0,
            taskTimeoutId: null,
          };
        }
        return updatedWorkers;
      });

      // Update shared resources
      setSharedResources((prevResources) => {
        const newResources = { ...prevResources };
        // Apply material costs
        for (const key in task.cost) {
          if (key !== "energy" && key !== "hunger" && key !== "morale") {
            newResources[key] =
              (newResources[key] ?? 0) - Math.abs(task.cost[key] ?? 0);
          }
        }
        // Apply material outcomes
        for (const key in task.outcome) {
          if (
            key !== "energy" &&
            key !== "hunger" &&
            key !== "morale" &&
            !(key in dailyGoal)
          ) {
            newResources[key] =
              (newResources[key] ?? 0) + ((task.outcome[key] as number) ?? 0);
          }
        }
        return newResources;
      });

      // Update goal progress
      setGoalProgress((prevProgress) => {
        const newProgress = { ...prevProgress };
        for (const key in task.outcome) {
          if (key in dailyGoal) {
            if (typeof dailyGoal[key] === "number") {
              newProgress[key] =
                ((newProgress[key] as number) ?? 0) +
                ((task.outcome[key] as number) ?? 0);
            } else {
              newProgress[key] = task.outcome[key] ?? newProgress[key]; // Handle non-numeric goals
            }
          }
        }
        return newProgress;
      });

      setFeedbackMessage(`${worker.name_he}: ${task.name_he} - הושלמה!`);
      setTimeout(() => setFeedbackMessage(null), 2000);
    },
    [availableTasks, dailyGoal]
  ); // Dependencies

  // --- Handle Performing a Task ---
  const handlePerformTask = useCallback(
    (task: Task) => {
      if (!selectedWorkerId || gameEnded) return;

      const workerIndex = workers.findIndex((w) => w.id === selectedWorkerId);
      if (workerIndex === -1) return;

      const worker = workers[workerIndex];
      const affordCheck = canAffordTask(task, worker);

      if (!affordCheck.affordable) {
        setFeedbackMessage(affordCheck.reason || "לא ניתן לבצע משימה זו.");
        setTimeout(() => setFeedbackMessage(null), 2500);
        return;
      }

      // Clear previous timeout if any (safety measure)
      if (worker.taskTimeoutId) {
        clearTimeout(worker.taskTimeoutId);
      }

      // Update worker state to 'working' and clear feedback
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) =>
          w.id === selectedWorkerId
            ? {
                ...w,
                status: "working",
                currentTaskId: task.id,
                taskProgress: 0,
              }
            : w
        )
      );
      setFeedbackMessage(null);

      // --- Task Duration Simulation ---
      const durationMillis = task.duration_seconds * 1000;
      let progressInterval: NodeJS.Timeout | null = null;

      // Optional: Progress update interval
      if (durationMillis > 100) {
        // Only show progress for tasks longer than 100ms
        progressInterval = setInterval(() => {
          setWorkers((currentWorkers) =>
            currentWorkers.map((w) => {
              if (w.id === selectedWorkerId && w.status === "working") {
                const currentProgress = w.taskProgress ?? 0;
                // Calculate progress based on time elapsed - more accurate way needed if interval isn't precise
                // Simple increment for now:
                const newProgress = Math.min(
                  100,
                  currentProgress +
                    (100 / task.duration_seconds) * (50 / 1000) * 100
                ); // Rough estimate
                return { ...w, taskProgress: newProgress };
              }
              return w;
            })
          );
        }, 50); // Update progress frequently
      }

      const taskTimeout = setTimeout(() => {
        if (progressInterval) clearInterval(progressInterval);
        completeTask(selectedWorkerId, task.id);
      }, durationMillis);

      // Store the timeout ID on the worker
      setWorkers((prevWorkers) =>
        prevWorkers.map((w) =>
          w.id === selectedWorkerId ? { ...w, taskTimeoutId: taskTimeout } : w
        )
      );
    },
    [selectedWorkerId, workers, gameEnded, canAffordTask, completeTask]
  );

  // --- Handle Worker Selection ---
  const handleSelectWorker = (workerId: string) => {
    setSelectedWorkerId((prevId) => (prevId === workerId ? null : workerId)); // Toggle selection
  };

  // --- Check Goal Met ---
  const checkGoalMet = useCallback((): GameResult => {
    let success = true;
    const achievement: { [key: string]: number | string | boolean } = {};

    for (const key in dailyGoal) {
      const target = dailyGoal[key];
      const current = goalProgressRef.current[key] ?? 0; // Use ref for latest value
      let achieved = false;

      if (typeof target === "number") {
        achieved = (current as number) >= target;
      } else {
        achieved = current === target;
      }
      achievement[key] = achieved;
      if (!achieved) {
        success = false;
      }
    }
    // Add final progress to achievement details
    Object.keys(goalProgressRef.current).forEach((key) => {
      achievement[`${key}_progress`] = goalProgressRef.current[key];
    });

    return {
      success,
      finalSharedResources: sharedResourcesRef.current, // Use ref
      finalWorkers: workersRef.current, // Use ref
      goalAchievement: achievement,
    };
  }, [dailyGoal]); // goalLabels removed as it's only for display

  // --- Handle End Game ---
  const handleEndGame = useCallback(() => {
    if (gameEnded) return;
    setGameEnded(true);

    // Clear all worker timeouts
    workersRef.current.forEach((worker) => {
      if (worker.taskTimeoutId) {
        clearTimeout(worker.taskTimeoutId);
      }
    });

    const result = checkGoalMet();
    onComplete(result);
  }, [gameEnded, checkGoalMet, onComplete]);

  // --- Start Game Logic ---
  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    // Reset state if needed for replayability
    setWorkers(
      initialWorkers.map((w) => ({
        ...w,
        taskTimeoutId: null,
        taskProgress: 0,
      }))
    );
    setSharedResources(initialSharedResources);
    setGoalProgress(() => {
      const initialProgress: DailyGoal = {};
      Object.keys(dailyGoal).forEach((key) => {
        initialProgress[key] = typeof dailyGoal[key] === "number" ? 0 : "";
      });
      return initialProgress;
    });
    setGlobalTime(globalTimeLimit_seconds);
    setSelectedWorkerId(null);
    setFeedbackMessage(null);
  };

  // --- Rendering ---
  const selectedWorker = workers.find((w) => w.id === selectedWorkerId);

  // Start Screen
  if (!gameStarted) {
    return (
      <div
        dir="rtl"
        className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/60 backdrop-blur-md border border-yellow-700 font-sans"
      >
        {title_he && (
          <h2 className="text-4xl font-bold mb-6 font-amatic text-yellow-400">
            {title_he}
          </h2>
        )}
        <p className="text-xl mb-8 font-sans">
          נהל את צוות העובדים שלך ועמוד במכסה היומית תחת עינם הפקוחה של הנוגשים
          המצרים.
        </p>
        <button
          onClick={startGame}
          className="px-10 py-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition duration-300 text-xl shadow-md hover:shadow-lg transform hover:scale-105 font-sans"
        >
          התחל משימה
        </button>
      </div>
    );
  }

  // End Screen
  if (gameEnded) {
    const result = checkGoalMet(); // Recalculate for display consistency
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
            המכסה לא הושגה. הנוגשים לא יהיו מרוצים...
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
        {/* Optional: Display final resources or worker states */}
        <button
          onClick={startGame} // Allow restarting
          className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition duration-300 shadow-md font-sans"
        >
          התחל מחדש
        </button>
      </div>
    );
  }

  // --- Main Game Screen ---
  return (
    <div
      dir="rtl"
      className="p-4 md:p-6 max-w-6xl w-full mx-auto text-white bg-black/50 backdrop-blur-sm rounded-lg border border-yellow-800 shadow-xl font-sans flex flex-col md:flex-row gap-4"
    >
      {/* Left Panel: Workers & Selected Worker */}
      <div className="flex-shrink-0 w-full md:w-1/3 space-y-4">
        {/* Worker List */}
        <div className="bg-black/40 p-3 rounded border border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-yellow-500">
            העובדים שלך
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {workers.map((worker) => {
              const { icon, color } = getWorkerStatusInfo(worker);
              const isSelected = worker.id === selectedWorkerId;
              return (
                <button
                  key={worker.id}
                  onClick={() => handleSelectWorker(worker.id)}
                  className={`w-full text-right p-2 rounded border transition-colors duration-200 ${
                    isSelected
                      ? "bg-yellow-700/50 border-yellow-500"
                      : "bg-black/30 border-gray-700 hover:bg-gray-700/50"
                  }`}
                >
                  <span className={`font-semibold ${color}`}>
                    {worker.name_he}
                  </span>
                  <span className="text-sm float-left">
                    {icon}{" "}
                    {worker.status === "working"
                      ? taskShortName(worker.currentTaskId)
                      : worker.status}
                  </span>
                  {/* Optional: Mini status bars */}
                  {worker.status === "working" &&
                    worker.taskProgress !== undefined && (
                      <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                        <div
                          className="bg-yellow-500 h-1 rounded-full"
                          style={{ width: `${worker.taskProgress}%` }}
                        ></div>
                      </div>
                    )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Worker Details & Tasks */}
        {selectedWorker && (
          <div className="bg-black/40 p-3 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-yellow-500">
              פרטי עובד: {selectedWorker.name_he}
            </h3>
            {/* Stats Bars */}
            <div className="space-y-1 mb-3 text-sm">
              {renderStatBar(
                "אנרגיה",
                selectedWorker.energy,
                selectedWorker.maxEnergy,
                Zap
              )}
              {renderStatBar(
                "רעב",
                selectedWorker.hunger,
                selectedWorker.maxHunger,
                UtensilsCrossed,
                true
              )}
              {renderStatBar(
                "מורל",
                selectedWorker.morale,
                selectedWorker.maxMorale,
                Smile
              )}
            </div>

            <h4 className="text-md font-semibold mb-2 text-yellow-400">
              משימות זמינות לעובד זה:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {availableTasks.map((task) => {
                const affordCheck = canAffordTask(task, selectedWorker);
                const isPerformingThisTask =
                  selectedWorker.status === "working" &&
                  selectedWorker.currentTaskId === task.id;
                const buttonTextPerforming = "בעבודה'..."; // Define text outside
                const buttonTextIdle = "בצע משימה"; // Define text outside
                return (
                  <div
                    key={task.id}
                    className={`p-2 rounded border text-sm ${
                      affordCheck.affordable && selectedWorker.status === "idle"
                        ? "border-yellow-700 bg-black/30"
                        : "border-gray-600 bg-black/20 opacity-70"
                    }`}
                  >
                    <p className="font-semibold text-yellow-300">
                      {task.name_he} ({task.duration_seconds} שנ)
                    </p>
                    {task.description_he && (
                      <p className="text-xs text-gray-300 mb-1">
                        {task.description_he}
                      </p>
                    )}
                    {/* Simplified Cost/Outcome display */}
                    <div className="text-xs text-gray-400">
                      {renderCostOutcome(
                        task,
                        sharedResourceLabels,
                        goalLabels
                      )}
                    </div>
                    {!affordCheck.affordable &&
                      selectedWorker.status === "idle" && (
                        <p className="text-xs text-red-400 mt-1">
                          <Info size={10} className="inline" />{" "}
                          {affordCheck.reason}
                        </p>
                      )}
                    <button
                      onClick={() => handlePerformTask(task)}
                      disabled={
                        !affordCheck.affordable ||
                        selectedWorker.status !== "idle" ||
                        gameEnded
                      }
                      className={`w-full mt-2 px-2 py-1 rounded font-bold text-black transition duration-200 text-xs ${
                        affordCheck.affordable &&
                        selectedWorker.status === "idle"
                          ? "bg-yellow-500 hover:bg-yellow-400"
                          : "bg-gray-500 cursor-not-allowed"
                      } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {isPerformingThisTask
                        ? buttonTextPerforming
                        : buttonTextIdle}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Resources, Goal, Timer */}
      <div className="flex-grow space-y-4">
        {/* Timer */}
        <div className="bg-black/60 p-3 rounded border border-red-700 text-center">
          <h3 className="text-xl font-semibold text-red-400">זמן נותר</h3>
          <p className="text-4xl font-bold font-mono">
            {formatTime(globalTime)}
          </p>
        </div>

        {/* Shared Resources */}
        <div className="bg-black/40 p-3 rounded border border-gray-600">
          <h3 className="text-lg font-semibold mb-2 text-yellow-500">
            משאבים משותפים
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {Object.keys(sharedResources).map((key) => (
              <div key={key} className="flex justify-between items-center">
                <span>{sharedResourceLabels[key] || key}:</span>
                <span className="font-bold">{sharedResources[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal */}
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
      </div>

      {/* Feedback Area */}
      {feedbackMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-3 rounded shadow-lg z-50 animate-pulse">
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};

// Helper function to format time
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

// Helper function to render stat bars
const renderStatBar = (
  label: string,
  value: number,
  max: number,
  IconComponent: React.ElementType,
  lowerIsBetter = false
) => (
  <div>
    <div className="flex justify-between items-center mb-0.5">
      <span className="flex items-center">
        <IconComponent size={12} className="mr-1" /> {label}
      </span>
      <span>
        {value.toFixed(0)} / {max}
      </span>
    </div>
    <div className="w-full bg-gray-600 rounded-full h-2.5">
      <div
        className={`${getProgressBarColor(
          value,
          max,
          lowerIsBetter
        )} h-2.5 rounded-full`}
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

// Helper to get short task name (if needed)
const taskShortName = (taskId: string | null): string => {
  if (!taskId) return "";
  // Simple implementation: could fetch from availableTasks if needed
  return taskId.split("_").slice(0, 2).join(" ");
};

// Helper to render cost/outcome compactly
const renderCostOutcome = (
  task: Task,
  labels: ResourceLabels,
  goalLabels: GoalLabels
): React.ReactNode => {
  const costs: string[] = [];
  const outcomes: string[] = [];

  Object.entries(task.cost).forEach(([key, value]) => {
    if (value !== 0) {
      costs.push(`${labels[key] || key}: ${value}`);
    }
  });
  Object.entries(task.requirements || {}).forEach(([key, value]) => {
    if (value && value > 0) {
      costs.push(`${labels[key] || key} דרוש: ${value}`);
    }
  });

  Object.entries(task.outcome).forEach(([key, value]) => {
    if (value !== 0) {
      const label = labels[key] || goalLabels[key] || key;
      const displayValue =
        typeof value === "number" ? (value > 0 ? `+${value}` : value) : value;
      outcomes.push(`${label}: ${displayValue}`);
    }
  });

  return (
    <>
      {costs.length > 0 && (
        <p className="text-red-400">עלות: {costs.join(", ")}</p>
      )}
      {outcomes.length > 0 && (
        <p className="text-green-400">תוצאה: {outcomes.join(", ")}</p>
      )}
    </>
  );
};

export default WorkerTaskManagerGame;
