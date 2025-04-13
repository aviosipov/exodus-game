import React from 'react';
import { SharedResources, ResourceLabels } from '../types';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography

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
        // Use Container with default (dark) variant
        <Container variant="default" className="p-3">
            {/* Use Typography for title */}
            <Typography variant="h3" className="mb-2 text-yellow-500">
                משאבים משותפים
            </Typography>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {resourceKeys.map((key) => (
                    <div key={key} className="flex justify-between items-center">
                        {/* Use Typography for label */}
                        <Typography variant="body2" as="span">
                            {resourceLabels[key] || key}:
                        </Typography>
                        {/* Use Typography for value */}
                        <Typography variant="body2" as="span" className="font-bold">
                            {sharedResources[key] ?? 0}
                        </Typography>
                    </div>
                ))}
            </div>
        </Container>
    );
};
