"use client"; // Required for useState, useEffect, useParams

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Hook to get route parameters
// import Container from "@/components/ui/Container"; // Removed unused import
import SimpleButton from "@/components/ui/SimpleButton"; // Import SimpleButton

// Define interfaces for better type safety
interface Choice {
    text: string;
    outcome: string;
}

interface SceneStep {
    id?: string; // Optional ID for specific steps/outcomes
    speaker: string;
    text: string;
    character_left_img: string | null;
    character_right_img: string | null;
    background_img: string | null;
    choices?: Choice[];
    next?: string; // ID of the next step to jump to
    end?: boolean; // Marks the end of the scene
}

interface AdventureData {
    title: string;
    description: string;
    scenes: SceneStep[];
}

// Renamed component to reflect its purpose
export default function AdventureScenePage() {
    const params = useParams();
    const adventureId = params?.id as string; // Get adventure ID from URL

    const [adventureData, setAdventureData] = useState<AdventureData | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch adventure data based on ID
    useEffect(() => {
        if (!adventureId) {
            setError("Adventure ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Dynamically import the JSON based on the adventureId
                const data = await import(`@/data/adventures/${adventureId}.json`);
                setAdventureData(data.default); // Assuming default export
                setCurrentStepIndex(0); // Reset step index when new data loads
            } catch (err) {
                console.error("Failed to load adventure data:", err);
                setError(`Failed to load adventure: ${adventureId}.`);
                setAdventureData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [adventureId]); // Re-run effect if adventureId changes

    // Derive current step data from adventureData and currentStepIndex
    const currentStepData = adventureData?.scenes?.[currentStepIndex];

    const handleChoice = (outcomeId: string) => {
        if (!adventureData?.scenes) return;
        const outcomeStepIndex = adventureData.scenes.findIndex(step => step.id === outcomeId);
        if (outcomeStepIndex !== -1) {
            setCurrentStepIndex(outcomeStepIndex);
        } else {
            console.error(`Outcome step with id "${outcomeId}" not found.`);
            nextStep();
        }
    };

    const nextStep = () => {
        if (!adventureData?.scenes || !currentStepData) return;

        if (currentStepData.end) {
            console.log("End of scene.");
            return;
        }

        let nextIndex = -1;
        const scene = adventureData.scenes;

        if (currentStepData.next) {
            nextIndex = scene.findIndex(step => step.id === currentStepData.next);
            if (nextIndex === -1) {
                console.error(`Next step with id "${currentStepData.next}" not found. Proceeding sequentially.`);
            }
        }

        if (nextIndex === -1) {
            nextIndex = currentStepIndex + 1;
        }

        while (nextIndex < scene.length && scene[nextIndex].id && !scene[nextIndex].choices && !currentStepData.next) {
             console.log(`Skipping outcome step ${nextIndex}`);
             nextIndex++;
        }

        if (nextIndex < scene.length) {
            setCurrentStepIndex(nextIndex);
        } else {
            console.log("End of scene reached.");
        }
    };

    // Helper to get image URL or null
    const getImageUrl = (path: string | null | undefined): string | null => path ? path : null;

    // --- Render Logic ---

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading Adventure...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (!currentStepData) {
        return <div className="flex justify-center items-center h-screen">Initializing scene...</div>;
    }

    const leftCharImg = getImageUrl(currentStepData.character_left_img);
    const rightCharImg = getImageUrl(currentStepData.character_right_img);
    const bgImg = getImageUrl(currentStepData.background_img);

    return (
        <div
            dir="rtl" // Right-to-left for Hebrew
            className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: bgImg ? `url('${bgImg}')` : 'none', backgroundColor: bgImg ? 'transparent' : '#e0d8c0' }} // Set background image or fallback color
        >
            {/* Left Character */}
            <div
                className={`character absolute bottom-[170px] left-[50px] h-[60%] w-[30%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${leftCharImg ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: leftCharImg ? `url('${leftCharImg}')` : 'none' }}
            ></div>
            {/* Right Character */}
            <div
                className={`character absolute bottom-[170px] right-[50px] h-[60%] w-[30%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${rightCharImg ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: rightCharImg ? `url('${rightCharImg}')` : 'none' }}
            ></div>
            {/* Dialogue Box - Aspect Ratio Container */}
            {/* Outer container sets the 80% width and positions */}
            <div className="absolute bottom-10 left-[10%] right-[10%] z-20"> {/* Changed left/right to 10% for 80% width */}
                <div className="relative w-full" style={{ paddingBottom: '24.6%' }}> {/* Aspect ratio container (218/886) */}
                    {/* Background Image */}
                    <img
                        src="/images/stone-bg-v3.png"
                        alt="Dialog background"
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-85" // Added opacity-75
                    />
                    {/* Yellow Overlay - Reinstated */}
                    
                    {/* Content Overlay - Removed yellow background */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-7"> {/* Removed bg-yellow-400/30 */}
                        {/* Speaker and Text */}
                        {/* Increased font size, added white text shadow */}
                        <div className="text-right text-black" style={{ textShadow: '0 0 5px white' }}>
                            <h3 className="font-bold text-2xl mb-2">{currentStepData.speaker || ""}</h3> {/* Increased to text-2xl */}
                            <p className="text-xl">{currentStepData.text}</p> {/* Increased to text-xl */}
                        </div>

                        {/* Buttons Area */}
                        {/* Added mt-4 for spacing */}
                        <div className="flex justify-center items-center mt-4"> {/* Changed justify-start to justify-center */}
                            {currentStepData.choices ? (
                                // Render choices if they exist using SimpleButton
                                (currentStepData.choices.map((choice, index) => (
                                    <SimpleButton
                                        key={index}
                                        variant="default" // Use default yellow style for choices
                                        className="ms-2 text-base px-4 py-2" // Increased text size and padding
                                        onClick={() => handleChoice(choice.outcome)}
                                    >
                                        {choice.text}
                                    </SimpleButton>
                                )))
                            ) : !currentStepData.end ?
                                /* Render "Next" button using SimpleButton */
                                <SimpleButton
                                    variant="bright" // Use bright blue style
                                    className="ms-2 text-base px-4 py-2" // Increased text size and padding
                                    onClick={nextStep}
                                >המשך {'>'} {/* Next > */}
                                </SimpleButton>
                             :
                                /* Optional: Render "Back to List" button using SimpleButton */
                                 <SimpleButton
                                    variant="secondary" // Use secondary gray style
                                    className="ms-2 text-base px-4 py-2" // Increased text size and padding
                                    onClick={() => window.location.href = '/adventure'} // Navigate back to list
                                >חזור לרשימה {/* Back to List */}
                                 </SimpleButton>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
