import React from 'react';
import Container from '@/components/ui/Container'; // Import Container
import { Typography } from '@/components/ui/Typography'; // Import Typography
import SimpleButton from '@/components/ui/SimpleButton'; // Import SimpleButton

interface StartScreenProps {
    title_he?: string;
    onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ title_he, onStartGame }) => {
    return (
        <Container
            variant="bright" // Use bright variant
            dir="rtl"
            // Removed text-white as bright variant handles text color
            className="flex flex-col items-center space-y-6 justify-center p-8 text-center max-w-2xl mx-auto font-sans"
        >
            {title_he && (
                // Use Typography for title - Use accent color variant and keep underline
                (<Typography variant="h3" color="accent" > {/* Use accent color */}
                    {title_he}
                </Typography>)
            )}
            {/* Use Typography for description */}
            <Typography variant="lead" color="secondary" > {/* Use lead variant and secondary color */}
                נהל את צוות העובדים שלך ועמוד במכסה היומית תחת עינם הפקוחה של הנוגשים
                המצרים.
            </Typography>
            {/* Use SimpleButton */}
            <SimpleButton
                variant="secondary" // Use default yellow variant
                onClick={onStartGame}
                className="text-xl" // Keep text size if needed
            >
                התחל משימה
            </SimpleButton>
        </Container>
    );
};
