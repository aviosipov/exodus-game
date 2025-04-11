import React from 'react';
import { SharedResources, ResourceLabels } from '../types';

interface ResourceDisplayProps {
    sharedResources: SharedResources;
    resourceLabels: ResourceLabels;
}

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
    sharedResources,
    resourceLabels,
}) => {
    // Filter out internal/stat labels if they exist in sharedResourceLabels
    const resourceKeys = Object.keys(sharedResources);

    return (
        <div className="bg-black/40 p-3 rounded border border-gray-600">
            <h3 className="text-lg font-semibold mb-2 text-yellow-500">
                משאבים משותפים
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {resourceKeys.map((key) => (
                    <div key={key} className="flex justify-between items-center">
                        <span>{resourceLabels[key] || key}:</span>
                        <span className="font-bold">{sharedResources[key] ?? 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
