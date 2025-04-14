"use client"; // Required for hooks

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HebrewTriviaGameProps, Question } from './types';

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const HebrewTriviaGame: React.FC<HebrewTriviaGameProps> = ({ questionSet, topic_he }) => { // Removed onGameComplete from props destructuring
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameStarted, setGameStarted] = useState(false); // New state for start screen
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);

  const currentQuestion: Question | undefined = useMemo(() => {
    return questionSet && currentQuestionIndex < questionSet.length
      ? questionSet[currentQuestionIndex]
      : undefined;
  }, [questionSet, currentQuestionIndex]);

  // Shuffle answers whenever the question changes
  useEffect(() => {
    if (currentQuestion) {
      const allAnswers = [
        currentQuestion.correct_answer_he,
        ...currentQuestion.incorrect_answers_he,
      ];
      setShuffledAnswers(shuffleArray(allAnswers));
      // Reset state for the new question
      setSelectedAnswer(null);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  }, [currentQuestion]);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (showFeedback || gameCompleted || !currentQuestion) return; // Prevent selecting while feedback is shown or game is over

    setSelectedAnswer(answer);
    setShowFeedback(true);
    const correct = answer === currentQuestion.correct_answer_he;
    setIsCorrect(correct);

    if (correct) {
      setScore((prevScore) => prevScore + 1);
    }

    // Delay before moving to the next question or ending the game
    const timer = setTimeout(() => {
      if (currentQuestionIndex < questionSet.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        // State reset for next question happens in the useEffect [currentQuestion]
      } else {
        setGameCompleted(true);
        // Removed call to onGameComplete as the prop is no longer passed
        // The component now handles displaying the end screen itself.
      }
    }, 1500); // 1.5 second delay for feedback

    // Cleanup timer if component unmounts or question changes before timeout finishes
    return () => clearTimeout(timer);

  }, [currentQuestion, currentQuestionIndex, questionSet, showFeedback, gameCompleted]); // Removed score and onGameComplete from dependencies

  const startGame = () => {
    setGameStarted(true);
    // Reset score and index in case of restart (though restart isn't implemented yet)
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameCompleted(false);
  };

  // --- Rendering ---

  // Start Screen
  if (!gameStarted) {
    return (
      // Use font-amatic for title, font-noto-serif for text
      <div dir="rtl" className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/50 backdrop-blur-sm">
        {topic_he && (
          <h2 className="text-5xl font-bold mb-6 font-amatic">{topic_he}</h2>
        )}
        <p className="text-xl mb-8 font-sans">מוכן להתחיל את משחק הטריוויה?</p> {/* Use default font */}
        <button
          onClick={startGame}
          className="px-10 py-4 bg-yellow-500 text-indigo-900 font-bold rounded-full hover:bg-yellow-400 transition duration-300 text-xl shadow-lg hover:shadow-xl transform hover:scale-105 font-sans" // Use default font
        >
          התחל משחק
        </button>
      </div>
    );
  }

  // Error Screen (if game started but no questions)
  if (!currentQuestion && !gameCompleted) {
    return <div dir="rtl" className="p-4 text-center text-red-500">שגיאה: לא נמצאו שאלות.</div>;
  }

  // Game Completion Screen
  if (gameCompleted) {
    // Restyled Game Completion Screen - Use fonts
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center text-white p-8 rounded-lg shadow-lg text-center max-w-2xl mx-auto bg-black/50 backdrop-blur-sm">
        <h2 className="text-5xl font-bold mb-6 font-amatic">המשחק הסתיים!</h2>
        <p className="text-2xl mb-8 font-sans">הניקוד הסופי שלך: <span className="font-bold text-yellow-400">{score}</span> מתוך <span className="font-bold">{questionSet.length}</span></p> {/* Use default font */}
        {/* Optional: Add a button to restart or close */}
        {/* <button onClick={() => window.location.reload()} className="px-8 py-3 bg-yellow-500 text-indigo-900 font-bold rounded-lg hover:bg-yellow-400 transition duration-300 text-lg font-sans">
          שחק שוב
        </button> */}
      </div>
    );
  }

  // Determine button style based on selection and feedback - Millionaire Style
  const getButtonClass = (answer: string) => {
    // Base style for the answer buttons - lozenge shape, dark background (Single line definition)
    const baseClass = "relative w-full text-center p-4 my-2 rounded-full border-2 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-900 bg-gradient-to-b from-indigo-700 to-indigo-800 border-indigo-500 hover:border-yellow-400 text-white font-semibold text-lg font-sans shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"; // Use default font
    // Add pseudo-elements for the angled ends if possible with Tailwind/CSS, otherwise keep rounded-full

    if (!showFeedback) {
      // Default state before selection
      return `${baseClass} hover:from-indigo-600 hover:to-indigo-700 focus:ring-yellow-400`;
    }

    // Feedback phase styling
    const isCorrectAnswer = answer === currentQuestion?.correct_answer_he;
    const isSelectedAnswer = answer === selectedAnswer;

    if (isSelectedAnswer) {
      return isCorrect
        ? `${baseClass} bg-gradient-to-b from-green-500 to-green-700 border-green-300 ring-2 ring-green-300 shadow-xl scale-105` // Correct selected: Green highlight
        : `${baseClass} bg-gradient-to-b from-red-500 to-red-700 border-red-300 ring-2 ring-red-300 shadow-xl scale-105`; // Incorrect selected: Red highlight
    } else if (isCorrectAnswer) {
      // Show the correct answer in green if the player chose wrong
      return `${baseClass} bg-gradient-to-b from-green-500 to-green-700 border-green-300 opacity-90`; // Correct answer (not selected): Green subtle
    } else {
      // Other incorrect answers - dimmed
      return `${baseClass} bg-gradient-to-b from-gray-600 to-gray-700 border-gray-500 opacity-60`;
    }
  };

  return (
    // Main container - Apply default font (font-sans/Rubik) as base
    <div dir="rtl" className="p-6 max-w-3xl w-full mx-auto text-white font-sans">
      {/* Progress/Score Display - Use default Rubik (sans-serif) */}
      <div className="flex justify-between items-center mb-6 text-sm text-indigo-300 px-4 font-sans">
        <span>שאלה {currentQuestionIndex + 1} / {questionSet.length}</span>
        <span>ניקוד: {score}</span>
      </div>
      {/* Question Display Area - Use default font (font-sans/Rubik) */}
      <div className="mb-8 p-5 bg-gradient-to-b from-indigo-800 to-indigo-900 rounded-xl border-2 border-indigo-600 shadow-lg min-h-[100px] flex items-center justify-center">
        <p className="text-xl md:text-2xl font-semibold text-center font-sans">{currentQuestion?.question_he}</p>
      </div>
      {/* Answer Options Area - Buttons now use default font (font-sans/Rubik) via baseClass */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {shuffledAnswers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(answer)}
            disabled={showFeedback || gameCompleted}
            className={getButtonClass(answer)}
          >
            {/* Optional: Add A/B/C/D prefix */}
            {/* <span className="font-sans font-bold mr-2">{String.fromCharCode(65 + index)}:</span> */}
            {answer}
          </button>
        ))}
      </div>
      {/* Feedback Area - Removed, feedback is now on buttons */}
      {/* {showFeedback && ( ... )} */}
    </div>
  );
};

export default HebrewTriviaGame;
