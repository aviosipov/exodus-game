import React from 'react';
import { Worker } from '../types';
import { Progress } from "@/components/ui/progress"; // Import shadcn Progress
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography

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
        // Use Container with 'default' (dark) variant
        <Container variant="default" className="p-3"> {/* Changed variant to 'default' */}
            {/* Use Typography for title */}
            <Typography variant="h3" className="mb-2 text-yellow-500">
                העובדים שלך
            </Typography>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {workers.map((worker) => {
                    const { icon, color } = getWorkerStatusInfo(worker);
                    const isSelected = worker.id === selectedWorkerId;
                    return (
                        <button
                            key={worker.id}
                            onClick={() => onSelectWorker(worker.id)}
                            // Keep button styling for now, as it's list-item specific
                            className={`w-full text-right p-2 rounded border transition-colors duration-200 ${isSelected
                                ? "bg-yellow-700/50 border-yellow-500"
                                : "bg-black/30 border-gray-700 hover:bg-gray-700/50"
                                }`}
                        >
                            {/* Use Typography for worker name */}
                            <Typography variant="body1" as="span" className={`font-semibold ${color}`}>
                                {worker.name_he}
                            </Typography>
                            {/* Use Typography for status */}
                            <Typography variant="small" as="span" className="float-left">
                                {icon}{" "}
                                {worker.status === "working"
                                    ? taskShortName(worker.currentTaskId)
                                    : worker.status}
                            </Typography>
                            {/* Progress Bar using shadcn/ui */}
                            {worker.status === "working" &&
                                worker.taskProgress !== undefined && (
                                   <Progress value={worker.taskProgress} className="h-1 w-full mt-1 bg-gray-600 [&>*]:bg-yellow-500" />
                                )}
                        </button>
                    );
                })}
            </div>
        </Container>
    );
};
