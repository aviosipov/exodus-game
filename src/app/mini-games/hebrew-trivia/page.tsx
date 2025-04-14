import React from 'react';
import fs from 'fs/promises'; // Use promises API for async file system access
import path from 'path';
import { Typography } from '@/components/ui/Typography';
import MenuButton from '@/components/ui/MenuButton';
import Link from 'next/link'; // Import Link for the back button

// Define the structure for a single question
interface Question {
  question_he: string;
  correct_answer_he: string;
  incorrect_answers_he: string[];
}

// Define the structure of the chapter data we expect in the JSON files
interface ChapterData {
  title_he: string;
  description_he: string;
  questions: Question[]; // Use the specific Question type
}

// Define the structure for the chapter info we'll pass to the component
interface ChapterInfo {
  id: string; // Filename without extension (e.g., 'early-days')
  title: string;
  description: string;
}

// Function to safely read and parse JSON
async function readChapterJson(filePath: string): Promise<ChapterData | null> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent) as ChapterData;
  } catch (error) {
    console.error(`Error reading or parsing JSON file ${filePath}:`, error);
    return null; // Return null if file reading/parsing fails
  }
}

// Server Component to display the list of trivia chapters
const HebrewTriviaChaptersPage = async () => {
  const chaptersDirectory = path.join(process.cwd(), 'src', 'data', 'hebrew-trivia');
  const chapters: ChapterInfo[] = []; // Use const as suggested by ESLint

  try {
    const files = await fs.readdir(chaptersDirectory);
    const jsonFiles = files.filter(file => file.endsWith('.json'));

    // Read details from each JSON file
    for (const file of jsonFiles) {
      const filePath = path.join(chaptersDirectory, file);
      const chapterData = await readChapterJson(filePath);

      if (chapterData) {
        const chapterId = path.basename(file, '.json'); // Get filename without extension
        chapters.push({
          id: chapterId,
          title: chapterData.title_he || 'פרק ללא כותרת', // Fallback title
          description: chapterData.description_he || 'תיאור חסר', // Fallback description
        });
      }
    }
  } catch (error) {
    console.error("Error reading chapters directory:", error);
    // Handle the error appropriately, maybe show an error message to the user
    // For now, chapters array will remain empty or partially filled
  }

  return (
    // Use a similar layout structure as the Daily Task Manager selection page
    <div
      dir="rtl"
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800" // Using trivia page background
    >
      {/* Optional: Add overlay if needed */}
      {/* <div className="absolute inset-0 w-full h-full bg-black/30 -z-10"></div> */}

      {/* Content container */}
      <div className="relative z-0 flex flex-col items-center w-full">
        {/* Title */}
        <Typography variant="h1" color="indigo-glow" className="mb-2">
          טריוויה עברית
        </Typography>
        {/* Subtitle */}
        <Typography variant="lead" color="secondary" className="mb-10 drop-shadow-md text-gray-200">
          בחרו פרק כדי לבחון את הידע שלכם בסיפור יציאת מצרים.
        </Typography>

        {/* Title for the button grid */}
        <Typography variant="h4" className="mb-6 drop-shadow-lg text-white">
          בחר פרק
        </Typography>

        {/* Grid for chapter selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
          {chapters.length > 0 ? (
            chapters.map((chapter) => (
              <MenuButton
                key={chapter.id}
                variant="dark"
                title={chapter.title}
                description={chapter.description}
                href={`/mini-games/hebrew-trivia/${chapter.id}`} // Link to the dynamic chapter page
                className="min-h-[8rem]"
              />
            ))
          ) : (
            <Typography variant="body1" color="secondary" className="text-center md:col-span-2"> {/* Changed variant to body1 */}
              לא נמצאו פרקי טריוויה זמינים.
            </Typography>
          )}
          {/* Optional Placeholder */}
          {/* <MenuButton
            variant="dark"
            title="בקרוב..."
            description="פרקים נוספים יתווספו בהמשך."
            className="min-h-[8rem]"
            disabled
          /> */}
        </div>

        {/* Back Button to Mini-Games Hub */}
        <div className="mt-8 w-full max-w-xs">
           <Link href="/mini-games">
             <MenuButton
                variant="default" // Use default yellow style for back button
                title="חזרה למשחקים"
                description="חזור לבחירת משחק אחר"
                // href="/mini-games" // Handled by Link
                className="text-center"
                titleClassName="text-lg"
                descriptionClassName="text-sm text-indigo-800"
              />
           </Link>
        </div>
      </div>
    </div>
  );
};

export default HebrewTriviaChaptersPage;
