import React from 'react';
import { Worker } from '../types';
import { Progress } from "@/components/ui/progress"; // Import shadcn Progress

interface WorkerListProps {
    workers: Worker[];
    selectedWorkerId: string | null;
    onSelectWorker: (workerId: string) => void;
    getWorkerStatusInfo: (worker: Worker) => { icon: React.ReactNode; color: string };
    taskShortName: (taskId: string | null) => string;
}

export const WorkerList: React.FC<WorkerListProps> = ({
    workers,
    selectedWorkerId,
    onSelectWorker,
    getWorkerStatusInfo,
    taskShortName,
}) => {
    return (
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
                            onClick={() => onSelectWorker(worker.id)}
                            className={`w-full text-right p-2 rounded border transition-colors duration-200 ${isSelected
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
                            {/* Progress Bar using shadcn/ui */}
                            {worker.status === "working" &&
                                worker.taskProgress !== undefined && (
                                   <Progress value={worker.taskProgress} className="h-1 w-full mt-1 bg-gray-600 [&>*]:bg-yellow-500" />
                                )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
