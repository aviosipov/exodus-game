import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation'; // Import notFound for error handling
import HebrewTriviaGame from '@/components/mini-games/hebrew-trivia/HebrewTriviaGame';
// Removed unused Typography import

// Define the structure for a single question (matching the selection page)
interface Question {
  question_he: string;
  correct_answer_he: string;
  incorrect_answers_he: string[];
}

// Define the structure of the chapter data we expect in the JSON files
interface ChapterData {
  title_he: string;
  description_he: string; // Keep description for potential future use
  questions: Question[];
}

// Function to safely read and parse JSON (can be moved to a shared lib later)
async function readChapterJson(filePath: string): Promise<ChapterData | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as ChapterData;
  } catch (error) {
    // Log specific error types if needed
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.warn(`Chapter JSON file not found: ${filePath}`);
    } else {
      console.error(`Error reading or parsing JSON file ${filePath}:`, error);
    }
    return null;
  }
}

// Define the props for the page component, including URL parameters
interface HebrewTriviaChapterPageProps {
  params: {
    chapterName: string; // This comes from the dynamic segment [chapterName]
  };
}

// Server Component for displaying a specific trivia chapter game
const HebrewTriviaChapterPage: React.FC<HebrewTriviaChapterPageProps> = async ({ params }) => {
  const { chapterName } = params;

  // Basic validation for chapterName to prevent directory traversal attacks
  if (!chapterName || chapterName.includes('..') || chapterName.includes('/')) {
    console.error("Invalid chapter name requested:", chapterName);
    notFound(); // Trigger a 404 Not Found page
  }

  const chapterFilePath = path.join(process.cwd(), 'src', 'data', 'hebrew-trivia', `${chapterName}.json`);
  const chapterData = await readChapterJson(chapterFilePath);

  // If chapter data couldn't be loaded, show a 404 page
  if (!chapterData) {
    notFound();
  }

  // Removed handleGameComplete function as it cannot be passed to client component

  return (
    // Use the same background as the original trivia page
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-4">
      {/* Render the game component with the loaded data */}
      <HebrewTriviaGame
        questionSet={chapterData.questions} // Pass the loaded questions
        // onGameComplete prop removed
        topic_he={chapterData.title_he} // Pass the chapter title as the topic
      />
    </div>
  );
};

export default HebrewTriviaChapterPage;

// Optional: Generate static paths if you know all chapters beforehand
// export async function generateStaticParams() {
//   const chaptersDirectory = path.join(process.cwd(), 'src', 'data', 'hebrew-trivia');
//   try {
//     const files = await fs.readdir(chaptersDirectory);
//     const jsonFiles = files.filter(file => file.endsWith('.json'));
//     return jsonFiles.map(file => ({
//       chapterName: path.basename(file, '.json'),
//     }));
//   } catch (error) {
//     console.error("Error generating static params for trivia chapters:", error);
//     return []; // Return empty array on error
//   }
// }
