import React from 'react';

interface StartScreenProps {
    title_he?: string;
    onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ title_he, onStartGame }) => {
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
                onClick={onStartGame}
                className="px-10 py-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition duration-300 text-xl shadow-md hover:shadow-lg transform hover:scale-105 font-sans"
            >
                התחל משימה
            </button>
        </div>
    );
};
