import React from 'react';
import { Worker, Task, ResourceLabels, GoalLabels } from '../types';
import { StatBar } from './StatBar'; // Import the StatBar component
import { Zap, UtensilsCrossed, Smile, Info } from 'lucide-react';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography
import SimpleButton from '@/components/ui/SimpleButton'; // Import SimpleButton

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
        // Use Container with 'default' (dark) variant
        <Container variant="default" className="p-3">
            {/* Use Typography for title */}
            <Typography variant="h3" className="mb-2 text-yellow-500">
                פרטי עובד: {selectedWorker.name_he}
            </Typography>
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

            {/* Use Typography for subtitle */}
            <Typography variant="h4" className="mb-2 text-yellow-400">
                משימות זמינות לעובד זה:
            </Typography>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {availableTasks.map((task) => {
                    const affordCheck = canAffordTask(task, selectedWorker);
                    const isPerformingThisTask =
                        selectedWorker.status === "working" &&
                        selectedWorker.currentTaskId === task.id;
                    const { costs, outcomes } = getCostOutcomeTextFunc(task, sharedResourceLabels, goalLabels);
                    const buttonTextPerforming = "בעבודה...";
                    const buttonTextIdle = "בצע משימה";

                    return (
                        // Use Container for each task item? Or keep div? Keep div for now.
                        <div
                            key={task.id}
                            className={`p-2 rounded border text-sm ${affordCheck.affordable && selectedWorker.status === "idle"
                                ? "border-yellow-700 bg-black/30"
                                : "border-gray-600 bg-black/20 opacity-70"
                                }`}
                        >
                            {/* Use Typography for task name */}
                            <Typography variant="body1" as="p" className="font-semibold text-yellow-300">
                                {task.name_he} ({task.duration_seconds} שנ&#39;)
                            </Typography>
                            {task.description_he && (
                                // Use Typography for task description
                                <Typography variant="small" as="p" className="text-gray-300 mb-1">
                                    {task.description_he}
                                </Typography>
                            )}
                            {/* Use Typography for cost/outcome */}
                            <Typography variant="small" as="div" className="text-gray-400">
                                {costs.length > 0 && <p className="text-red-400">עלות: {costs.join(', ')}</p>}
                                {outcomes.length > 0 && <p className="text-green-400">תוצאה: {outcomes.join(', ')}</p>}
                            </Typography>
                            {!affordCheck.affordable &&
                                selectedWorker.status === "idle" && (
                                    // Use Typography for affordability reason
                                    <Typography variant="small" as="p" className="text-red-400 mt-1">
                                        <Info size={10} className="inline" />{" "}
                                        {affordCheck.reason}
                                    </Typography>
                                )}
                            {/* Use SimpleButton for task action */}
                            <SimpleButton
                                variant="default" // Use default yellow variant
                                onClick={() => onPerformTask(task)}
                                disabled={
                                    !affordCheck.affordable ||
                                    selectedWorker.status !== "idle" ||
                                    gameEnded
                                }
                                className={`w-full mt-2 py-1 text-xs ${!(affordCheck.affordable && selectedWorker.status === "idle") ? "bg-gray-500 !border-gray-700 hover:bg-gray-500 cursor-not-allowed" : ""}`} // Override disabled style slightly
                            >
                                {isPerformingThisTask
                                    ? buttonTextPerforming
                                    : buttonTextIdle}
                            </SimpleButton>
                        </div>
                    );
                })}
            </div>
        </Container>
    );
};
