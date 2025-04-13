"use client"; // Required for useState and useEffect

import React, { useState, useEffect } from "react";

// --- Game Data ---
const scene = [
    {
        id: 'start',
        speaker: "מספר", // Narrator
        text: "השמש הקופחת מסתננת בין הענפים. אתה מרגיש את העייפות והכאב מצטברים בכל תנועה...", // "The scorching sun filters through the branches. You feel the fatigue and pain accumulating with every movement..."
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        background_img: "/images/ancient_egypt_prosperity_bg.webp" // Use existing background
    },
    {
        speaker: "עוזיריס", // Osiris
        text: "אוהד, הבא לי כוס מים – אני צמא.", // "Ohad, bring me a cup of water – I am thirsty."
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        background_img: "/images/ancient_egypt_prosperity_bg.webp" // Use existing background
    },
    {
        speaker: "אוהד (מחשבות)", // Ohad (Internal)
        text: "למה אני זוכה לקבל רק את הפקודות הללו? פעם הייתי נערץ, והיום... האם אין בי את הכוח לשנות דבר?", // "Why do I only get these commands? I was once admired, and today... Do I not have the strength to change anything?"
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        background_img: "/images/ancient_egypt_prosperity_bg.webp" // Use existing background
    },
    {
        speaker: "מספר", // Narrator
        text: "כיצד תגיב?", // "How do you respond?"
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        background_img: "/images/ancient_egypt_prosperity_bg.webp", // Use existing background
        choices: [
            { text: "התנגד קלות: \"אבל אדוני, גם אני צמא...\"", outcome: 'resist' }, // "Resist slightly: \"But sir, I am also thirsty...\""
            { text: "הגב בשתיקה.", outcome: 'silent' }, // "React silently."
            { text: "הגב באירוניה: \"נראה שהמים היום כבדים מדי בשבילך, אדוני...\"", outcome: 'irony' } // "React with irony: \"It seems the water today is too heavy for you, sir...\""
        ]
    },
    // --- Outcomes ---
    {
        id: 'resist',
        speaker: "עוזיריס", // Osiris
        text: "חוצפה! (כעסו מתלקח, אך משהו מתעורר בתוך אוהד... רצון לשינוי).", // "Insolence! (His anger flares, but something stirs within Ohad... a desire for change)."
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        background_img: "/images/ancient_egypt_prosperity_bg.webp", // Use existing background
        next: 'end_scene'
    },
    {
        id: 'silent',
        speaker: "מספר", // Narrator
        text: "(אוהד מביא את המים בשקט, סערת רוחו הפנימית חבויה. האוויר נותר כבד.)", // "(Ohad silently fetches the water, his inner turmoil hidden. The air remains heavy.)"
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        background_img: "/images/ancient_egypt_prosperity_bg.webp", // Use existing background
        next: 'end_scene'
    },
    {
        id: 'irony',
        speaker: "עוזיריס", // Osiris
        text: "(עוזיריס נראה מבולבל לרגע, אולי הבהוב של הפתעה חוצה את פניו.)", // "(Osiris looks momentarily confused, perhaps a flicker of surprise crosses his face.)"
        character_right_img: "/images/oziris_avatar_nobg.png", // Use existing Osiris image
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        background_img: "/images/ancient_egypt_prosperity_bg.webp", // Use existing background
        next: 'end_scene'
    },
    {
        id: 'end_scene',
        speaker: "מספר", // Narrator
        text: "בעוד הכוס מתמלאת, עולה בך שאלה: האם הגיע הזמן לשנות את מהלך חייך, או שעליך להישאר בצל הפחד? כל בחירה נושאת בתוכה ניצוץ שיכול להוביל לגאולה.", // "As the cup is filled, a question arises within you: Is it time to change the course of your life, or must you remain in the shadow of fear? Each choice carries a spark that could lead to redemption."
        character_left_img: "/images/ohad_avatar_nobg.png", // Use existing Ohad image
        character_right_img: null, // Osiris fades or is gone
        background_img: "/images/ancient_egypt_prosperity_bg.webp", // Use existing background
        end: true
    }
];

// Changed function name from Home to AdventurePage to avoid conflicts
export default function AdventurePage() {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentStepData, setCurrentStepData] = useState(scene[0]);

    // Update currentStepData whenever currentStepIndex changes
    useEffect(() => {
        setCurrentStepData(scene[currentStepIndex]);
    }, [currentStepIndex]);

    const handleChoice = (outcomeId: string) => {
        const outcomeStepIndex = scene.findIndex(step => step.id === outcomeId);
        if (outcomeStepIndex !== -1) {
            setCurrentStepIndex(outcomeStepIndex);
        } else {
            console.error(`Outcome step with id "${outcomeId}" not found.`);
            // Fallback to next sequential step if outcome not found
            nextStep();
        }
    };

    const nextStep = () => {
        const currentStep = scene[currentStepIndex];

        if (currentStep.end) {
            console.log("End of scene.");
            // Optionally reset or show a final message/button
            // setCurrentStepIndex(0); // Example: Restart scene
            return;
        }

        let nextIndex = -1;

        // If the current step has a specific 'next' id, find and jump to it
        if (currentStep.next) {
            nextIndex = scene.findIndex(step => step.id === currentStep.next);
            if (nextIndex === -1) {
                console.error(`Next step with id "${currentStep.next}" not found. Proceeding sequentially.`);
            }
        }

        // If no specific 'next' or it wasn't found, proceed sequentially
        if (nextIndex === -1) {
            nextIndex = currentStepIndex + 1;
        }

        // Skip over intermediate outcome steps if progressing sequentially
        while (nextIndex < scene.length && scene[nextIndex].id && !scene[nextIndex].choices && !currentStep.next) {
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
    const getImageUrl = (path: string | null | undefined) => path ? path : null;

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
                className={`character absolute bottom-[170px] left-[50px] h-[60%] w-[30%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${leftCharImg ? 'opacity-100' : 'opacity-0'}`} // Removed debug background color
                style={{ backgroundImage: leftCharImg ? `url('${leftCharImg}')` : 'none' }}
            ></div>

            {/* Right Character */}
            <div
                className={`character absolute bottom-[170px] right-[50px] h-[60%] w-[30%] bg-contain bg-no-repeat bg-bottom transition-opacity duration-500 ease-in-out ${rightCharImg ? 'opacity-100' : 'opacity-0'}`} // Removed debug background color
                style={{ backgroundImage: rightCharImg ? `url('${rightCharImg}')` : 'none' }}
            ></div>

            {/* Dialogue Box */}
            <div className="absolute bottom-5 left-5 right-5 h-[150px] z-20">
                <div className="bg-black/70 text-white rounded-lg p-4 h-full border border-gray-600 flex flex-col justify-between">
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
                            // Optional: Render something at the end, e.g., a restart button
                             <button
                                className="ms-2 px-3 py-1 bg-gray-500 hover:bg-gray-700 rounded text-sm"
                                onClick={() => setCurrentStepIndex(0)} // Restart
                            >
                                התחל מחדש {/* Restart */}
                            </button>
                        )}
                    </div>
                </div>
            </div>

             {/* Choices Box (Alternative centered display - kept commented out for now) */}
             {/*
             {currentStepData.choices && (
                <div id="choices-box" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-90 p-5 rounded-lg flex flex-col gap-2 z-10">
                    {currentStepData.choices.map((choice, index) => (
                        <button
                            key={index}
                            className='choice-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300'
                            onClick={() => handleChoice(choice.outcome)}
                        >
                            {choice.text}
                        </button>
                    ))}
                </div>
             )}
             */}
        </div>
    );
}
