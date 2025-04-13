"use client"; // Required for useState, useEffect, useParams

import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation'; // Hook to get route parameters
import Container from "@/components/ui/Container"; // Import the Container component

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
                // Note: This uses dynamic import, assuming JSON files are accessible relative to the built code.
                // A more robust approach might involve an API route or getStaticProps/getServerSideProps
                // if JSON files are in the public directory or fetched from a server.
                // For simplicity with local JSON files in `src/data`, we'll use require for now,
                // but be aware this might not work optimally in all Next.js deployment scenarios.
                // A better approach for Next.js >= 13 App Router is needed here.
                // Let's assume an API route /api/adventures/[id] exists for fetching.

                // --- Placeholder for actual data fetching ---
                // In a real app, fetch from `/api/adventures/${adventureId}` or use server-side fetching
                // For now, we'll simulate fetching the previously created JSON
                if (adventureId === 'days_of_honor') {
                     const data = await import(`@/data/adventures/days_of_honor.json`);
                     setAdventureData(data.default); // Assuming default export
                } else {
                    throw new Error(`Adventure "${adventureId}" not found.`);
                }
                // --- End Placeholder ---

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
            // Fallback to next sequential step if outcome not found
            nextStep();
        }
    };

    const nextStep = () => {
        if (!adventureData?.scenes || !currentStepData) return;

        if (currentStepData.end) {
            console.log("End of scene.");
            // Optionally reset, navigate away, or show a final message/button
            // setCurrentStepIndex(0); // Example: Restart scene
            return;
        }

        let nextIndex = -1;
        const scene = adventureData.scenes; // Alias for convenience

        // If the current step has a specific 'next' id, find and jump to it
        if (currentStepData.next) {
            nextIndex = scene.findIndex(step => step.id === currentStepData.next);
            if (nextIndex === -1) {
                console.error(`Next step with id "${currentStepData.next}" not found. Proceeding sequentially.`);
            }
        }

        // If no specific 'next' or it wasn't found, proceed sequentially
        if (nextIndex === -1) {
            nextIndex = currentStepIndex + 1;
        }

        // Skip over intermediate outcome steps if progressing sequentially
        while (nextIndex < scene.length && scene[nextIndex].id && !scene[nextIndex].choices && !currentStepData.next) {
             // Only skip if we are moving sequentially (not explicitly jumping via 'next')
             // and the target step looks like an outcome step (has id, no choices)
             console.log(`Skipping outcome step ${nextIndex}`);
             nextIndex++;
        }

        if (nextIndex < scene.length) {
            setCurrentStepIndex(nextIndex);
        } else {
            console.log("End of scene reached.");
            // Handle end of scene if reached sequentially
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
        // This might happen briefly or if data is malformed
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

            {/* Dialogue Box - Using Container component */}
            <div className="absolute bottom-5 left-5 right-5 h-[150px] z-20">
                <Container variant="dialog" className="h-full flex flex-col justify-between"> {/* Use Container with dialog variant */}
                    {/* Speaker and Text */}
                    <div className="text-right">
                        <h3 className="font-bold text-lg mb-2">{currentStepData.speaker || ""}</h3>
                        <p className="text-base">{currentStepData.text}</p>
                    </div>

                    {/* Buttons Area */}
                    <div className="flex justify-start items-center">
                        {currentStepData.choices ? (
                            // Render choices if they exist
                            currentStepData.choices.map((choice, index) => (
                                <button
                                    key={index}
                                    className="ms-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition duration-300"
                                    onClick={() => handleChoice(choice.outcome)}
                                >
                                    {choice.text}
                                </button>
                            ))
                        ) : !currentStepData.end ? (
                            // Render "Next" button if no choices and not the end
                            <button
                                className="ms-2 px-3 py-1 bg-blue-500 hover:bg-blue-700 rounded text-sm"
                                onClick={nextStep}
                            >
                                המשך {'>'} {/* Next > */}
                            </button>
                        ) : (
                            // Optional: Render something at the end, e.g., a restart button or link back
                             <button
                                className="ms-2 px-3 py-1 bg-gray-500 hover:bg-gray-700 rounded text-sm"
                                onClick={() => window.location.href = '/adventure'} // Navigate back to list
                            >
                                חזור לרשימה {/* Back to List */}
                            </button>
                        )}
                    </div>
                </Container> {/* Close Container */}
            </div>
        </div>
    );
}
