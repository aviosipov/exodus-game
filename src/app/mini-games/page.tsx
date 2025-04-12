"use client"; // For client-side interactions

import Link from 'next/link';
// Removed unused useState import

export default function MiniGamesHub() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#e0d8c0] p-8"> {/* Using fallback color from main page */}
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">משחקים מיני</h1> {/* Mini-Games */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Space Invaders Card */}
        <GameCard
          title="חלליות פולשות"
          description="הגן על התקווה שלך מול סכנות ומכשולים"
          href="/mini-games/space-invaders"
          imageUrl="/images/space_invaders_placeholder.png" // Placeholder - update if you have an image
        />

        {/* Daily Task Manager Card */}
        <GameCard
          title="ניהול משימות צוות יומי"
          description="נהל את המשימות היומיות של העובדים והמשאבים לעמידה ביעדים"
          href="/mini-games/daily-task-manager"
          imageUrl="/images/task_manager_placeholder.png" // Placeholder - update if you have an image
        />

        {/* Hebrew Trivia Card */}
        <GameCard
          title="טריוויה עברית"
          description="השלם את הפסוק והציווי במשחק ידע מרתק"
          href="/mini-games/hebrew-trivia"
          imageUrl="/images/trivia_placeholder.png" // Placeholder - update if you have an image
        />
      </div>

      {/* Back to Story Button */}
      <div className="mt-10 text-center">
        <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          חזרה לסיפור
        </Link>
      </div>
    </div>
  );
}

// Define props type for GameCard
interface GameCardProps {
  title: string;
  description: string;
  href: string;
  imageUrl?: string; // Optional image URL
}

// Reusable component for game cards
function GameCard({ title, description, href, imageUrl }: GameCardProps) {
  return (
    <Link href={href} className="block group">
      <div className="bg-black/70 border border-gray-600 rounded-lg p-6 hover:bg-black/80 transition duration-300 h-full flex flex-col text-white shadow-lg overflow-hidden">
        {imageUrl && (
          <div className="mb-4 h-40 bg-gray-700 rounded overflow-hidden flex items-center justify-center">
            {/* Basic image placeholder */}
            <img src={imageUrl} alt={`${title} preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => e.currentTarget.style.display = 'none'} />
             {/* Fallback text if image fails */}
            {!imageUrl && <span className="text-gray-400">אין תמונה</span>}
          </div>
        )}
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-300 mb-4 flex-grow">{description}</p>
        <div className="mt-auto text-left"> {/* Aligns button to bottom-left (visually bottom-right in RTL) */}
          <span className="inline-block bg-green-600 group-hover:bg-green-700 text-white py-2 px-4 rounded transition duration-300">
            שחק עכשיו {'<'} {/* Play Now < */}
          </span>
        </div>
      </div>
    </Link>
  );
}
