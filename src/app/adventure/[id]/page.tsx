"use client"; // Required for useState, useEffect, useParams

import React, { useState, useEffect, useRef } from "react"; // Added useRef
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

    // Determine language and text direction
    const isRussian = adventureId?.endsWith('_ru');
    const textDirection = isRussian ? 'ltr' : 'rtl';
    const textAlignClass = isRussian ? 'text-left' : 'text-right';
    const continueButtonText = isRussian ? 'Продолжить >' : 'המשך >';
    const backToListButtonText = isRussian ? 'Назад к списку' : 'חזור לרשימה';


    const [adventureData, setAdventureData] = useState<AdventureData | null>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null); // Ref for the audio element

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

    // Effect to handle audio playback when the step changes
    useEffect(() => {
        if (currentStepData && adventureId && audioRef.current) {
            const sceneId = currentStepData.id || `scene_${currentStepIndex}`;
            const audioSrc = `/audio/adventures/${adventureId}/${adventureId}.${sceneId}.mp3`;

            // Stop previous audio if playing
            audioRef.current.pause();
            audioRef.current.currentTime = 0;

            // Set new source and attempt to play
            audioRef.current.src = audioSrc;
            audioRef.current.load(); // Important to load the new source

            // Attempt to play, handle potential autoplay restrictions
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Autoplay was prevented.
                    console.warn(`Audio autoplay prevented for ${audioSrc}:`, error);
                    // You might want to show a play button here if autoplay fails.
                });
            }

             // Cleanup function to pause audio when component unmounts or step changes
             return () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                }
            };
        }
    }, [currentStepData, adventureId, currentStepIndex]); // Depend on currentStepData and adventureId

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
            // Consider adding navigation back or to an end screen here
            // For now, it just stops progression.
            return;
        }

        const nextIndex = currentStepIndex + 1;
        const scene = adventureData.scenes; // Keep for checking bounds

        if (nextIndex < scene.length) {
            setCurrentStepIndex(nextIndex);
        } else {
            console.log("End of adventure reached.");
            // Optional: Navigate back or show a completion message
            // Example: window.location.href = '/adventure';
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
            dir={textDirection} // Dynamic direction based on language
            // Mobile first: default bg color, md+ applies image styles
            className="relative w-screen h-screen overflow-hidden bg-[#e0d8c0] md:bg-cover md:bg-center md:bg-no-repeat"
            // Inline style now only sets the image URL if it exists
            style={{ backgroundImage: bgImg ? `url('${bgImg}')` : 'none' }}
        >
            {/* Left Character */}
            <div
                className={`character absolute bottom-0 left-0 h-[85%] w-[42%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${leftCharImg ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: leftCharImg ? `url('${leftCharImg}')` : 'none' }}
            ></div>
            {/* Right Character */}
            <div
                className={`character absolute bottom-0 right-0 h-[85%] w-[42%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${rightCharImg ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: rightCharImg ? `url('${rightCharImg}')` : 'none' }}
            ></div>

            {/* --- Mobile Dialog --- */}
            <div className="absolute top-20 left-4 right-4 z-20 bg-gray-100/70 rounded-lg overflow-hidden p-7 md:hidden"> {/* Increased top margin to top-8 */}
                <div className="flex flex-col justify-between h-full">
                    {/* Speaker and Text */}
                    <div className={`${textAlignClass} text-black`} style={{ textShadow: '0 0 5px white' }}>
                        <h3 className="font-bold text-2xl mb-2">{currentStepData.speaker || ""}</h3>
                        <p className="text-xl">{currentStepData.text}</p>
                    </div>
                    {/* Buttons Area - Changed to flex-col for mobile row layout */}
                    <div className="flex flex-col justify-center items-center mt-4">
                        {currentStepData.choices ? (
                            (currentStepData.choices.map((choice, index) => (
                                <SimpleButton
                                    key={`mobile-${index}`}
                                    variant="default"
                                    className="mb-2 text-base px-4 py-2 w-full" // Changed ms-2 to mb-2, added w-full
                                    onClick={() => handleChoice(choice.outcome)}
                                >
                                    {choice.text}
                                </SimpleButton>
                            )))
                        ) : !currentStepData.end ?
                            <SimpleButton
                                variant="bright"
                                className="ms-2 text-base px-4 py-2"
                                onClick={nextStep}
                            >{continueButtonText}
                            </SimpleButton>
                         :
                             <SimpleButton
                                variant="secondary"
                                className="ms-2 text-base px-4 py-2"
                                onClick={() => window.location.href = '/adventure'}
                            >{backToListButtonText}
                             </SimpleButton>
                        }
                    </div>
                </div>
            </div>

            {/* --- Desktop Dialog --- */}
            <div className="hidden md:block absolute bottom-10 left-[18%] right-[18%] z-20"> {/* Show only on md+ */}
                <div className="relative w-full" style={{ paddingBottom: '24.6%' }}> {/* Aspect ratio container */}
                    {/* Background Image */}
                    <img
                        src="/images/stone-bg-v3.png"
                        alt="Dialog background"
                        className="absolute inset-0 w-full h-full object-cover z-0 opacity-85"
                    />
                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-10 flex flex-col justify-between p-7">
                        {/* Speaker and Text */}
                        <div className={`${textAlignClass} text-black`} style={{ textShadow: '0 0 5px white' }}>
                            <h3 className="font-bold text-2xl mb-2">{currentStepData.speaker || ""}</h3>
                            <p className="text-xl">{currentStepData.text}</p>
                        </div>
                        {/* Buttons Area */}
                        <div className="flex justify-center items-center mt-4">
                            {currentStepData.choices ? (
                                (currentStepData.choices.map((choice, index) => (
                                    <SimpleButton
                                        key={`desktop-${index}`}
                                        variant="default"
                                        className="ms-2 text-base px-4 py-2"
                                        onClick={() => handleChoice(choice.outcome)}
                                    >
                                        {choice.text}
                                    </SimpleButton>
                                )))
                            ) : !currentStepData.end ?
                                <SimpleButton
                                    variant="bright"
                                    className="ms-2 text-base px-4 py-2"
                                    onClick={nextStep}
                                >{continueButtonText}
                                </SimpleButton>
                             :
                                 <SimpleButton
                                    variant="secondary"
                                    className="ms-2 text-base px-4 py-2"
                                    onClick={() => window.location.href = '/adventure'}
                                >{backToListButtonText}
                                 </SimpleButton>
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Player */}
            <audio ref={audioRef} preload="auto" />
        </div>
    );
}
