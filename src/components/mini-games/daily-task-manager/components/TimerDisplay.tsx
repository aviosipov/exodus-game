import React from 'react';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography

interface TimerDisplayProps {
    globalTime: number;
    formatTimeFunc: (seconds: number) => string; // Pass the function
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
    globalTime,
    formatTimeFunc,
}) => {
    return (
        // Use Container with default (dark) variant
        <Container variant="default" className="p-3 text-center border-red-700"> {/* Keep red border */}
            {/* Use Typography for title */}
            <Typography variant="h3" color="destructive" className="text-xl font-semibold"> {/* Use destructive color */}
                זמן נותר
            </Typography>
            {/* Use Typography for time */}
            <Typography variant="h2" color="inherit" className="font-mono"> {/* Use h2 for larger size, keep mono font */}
                {formatTimeFunc(globalTime)}
            </Typography>
        </Container>
    );
};
