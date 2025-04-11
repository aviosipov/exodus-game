import React from 'react';
import { Worker, Task, ResourceLabels, GoalLabels } from '../types';
import { StatBar } from './StatBar'; // Import the StatBar component
import { Zap, UtensilsCrossed, Smile, Info } from 'lucide-react';

interface SelectedWorkerPanelProps {
    selectedWorker: Worker;
    availableTasks: Task[];
    sharedResourceLabels: ResourceLabels;
    goalLabels: GoalLabels;
    gameEnded: boolean;
    canAffordTask: (task: Task, worker: Worker) => { affordable: boolean; reason: string | null };
    onPerformTask: (task: Task) => void;
    getProgressBarColorFunc: (value: number, max: number, lowerIsBetter?: boolean) => string;
    getCostOutcomeTextFunc: (task: Task, labels: ResourceLabels, goalLabels: GoalLabels) => { costs: string[], outcomes: string[] };
}

export const SelectedWorkerPanel: React.FC<SelectedWorkerPanelProps> = ({
    selectedWorker,
    availableTasks,
    sharedResourceLabels,
    goalLabels,
    gameEnded,
    canAffordTask,
    onPerformTask,
    getProgressBarColorFunc,
    getCostOutcomeTextFunc,
}) => {
    return (
        <div className="bg-black/40 p-3 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-yellow-500">
                פרטי עובד: {selectedWorker.name_he}
            </h3>
            {/* Stats Bars */}
            <div className="space-y-1 mb-3 text-sm">
                <StatBar
                    label="אנרגיה"
                    value={selectedWorker.energy}
                    max={selectedWorker.maxEnergy}
                    IconComponent={Zap}
                    getProgressBarColorFunc={getProgressBarColorFunc}
                />
                <StatBar
                    label="רעב"
                    value={selectedWorker.hunger}
                    max={selectedWorker.maxHunger}
                    IconComponent={UtensilsCrossed}
                    lowerIsBetter={true}
                    getProgressBarColorFunc={getProgressBarColorFunc}
                />
                <StatBar
                    label="מורל"
                    value={selectedWorker.morale}
                    max={selectedWorker.maxMorale}
                    IconComponent={Smile}
                    getProgressBarColorFunc={getProgressBarColorFunc}
                />
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
                    const { costs, outcomes } = getCostOutcomeTextFunc(task, sharedResourceLabels, goalLabels);
                    const buttonTextPerforming = "בעבודה..."; // Use simple string
                    const buttonTextIdle = "בצע משימה";

                    return (
                        <div
                            key={task.id}
                            className={`p-2 rounded border text-sm ${affordCheck.affordable && selectedWorker.status === "idle"
                                ? "border-yellow-700 bg-black/30"
                                : "border-gray-600 bg-black/20 opacity-70"
                                }`}
                        >
                            <p className="font-semibold text-yellow-300">
                                {task.name_he} ({task.duration_seconds} שנ&#39;)
                            </p>
                            {task.description_he && (
                                <p className="text-xs text-gray-300 mb-1">
                                    {task.description_he}
                                </p>
                            )}
                            {/* Simplified Cost/Outcome display */}
                            <div className="text-xs text-gray-400">
                                {costs.length > 0 && <p className="text-red-400">עלות: {costs.join(', ')}</p>}
                                {outcomes.length > 0 && <p className="text-green-400">תוצאה: {outcomes.join(', ')}</p>}
                            </div>
                            {!affordCheck.affordable &&
                                selectedWorker.status === "idle" && (
                                    <p className="text-xs text-red-400 mt-1">
                                        <Info size={10} className="inline" />{" "}
                                        {affordCheck.reason}
                                    </p>
                                )}
                            <button
                                onClick={() => onPerformTask(task)}
                                disabled={
                                    !affordCheck.affordable ||
                                    selectedWorker.status !== "idle" ||
                                    gameEnded
                                }
                                className={`w-full mt-2 px-2 py-1 rounded font-bold text-black transition duration-200 text-xs ${affordCheck.affordable &&
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
    );
};
