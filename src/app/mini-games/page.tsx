"use client"; // For client-side interactions

import Link from 'next/link';
import Container from '@/components/ui/Container'; // Import Container
import Button from '@/components/ui/Button'; // Import Button

export default function MiniGamesHub() {
  return (
    <div
      dir="rtl"
      // Applied background using ::before pseudo-element
      className="relative min-h-screen p-8 isolate
                 before:absolute before:inset-0 before:-z-10
                 before:bg-[url('/images/mini_games_bg.png')] before:bg-cover before:bg-center before:bg-no-repeat
                 before:bg-black/50 before:content-['']" // Slightly darker overlay
    >
      <h1 className="text-4xl font-bold mb-8 text-center text-white drop-shadow-md">משחקים מיני</h1> {/* Mini-Games - Adjusted size and color */}

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

      {/* Back to Main Menu Button - Using Button component */}
      <div className="mt-10 text-center">
        <Link href="/" passHref legacyBehavior>
          <Button variant="primary"> {/* Use primary button */}
            חזרה לתפריט הראשי
          </Button>
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

// Reusable component for game cards - Using Container and Button
function GameCard({ title, description, href, imageUrl }: GameCardProps) {
  return (
    <Link href={href} className="block group">
      {/* Use Container for card structure */}
      <Container
        variant="dialog"
        className="p-6 hover:bg-black/80 transition duration-300 h-full flex flex-col shadow-lg overflow-hidden" // Apply variant, add layout, hover, shadow, overflow, keep padding
      >
        {imageUrl && (
          <div className="mb-4 h-40 bg-gray-700 rounded overflow-hidden flex items-center justify-center"> {/* Keep image container */}
            <img src={imageUrl} alt={`${title} preview`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => e.currentTarget.style.display = 'none'} />
             {/* Fallback text if image fails */}
            {!imageUrl && <span className="text-gray-400">אין תמונה</span>}
          </div>
        )}
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-gray-300 mb-4 flex-grow">{description}</p>
        {/* Use Button component for action */}
        <div className="mt-auto text-left">
          <Button variant="primary" className="group-hover:bg-green-700"> {/* Use primary, maybe adjust hover if needed */}
            שחק עכשיו {'<'} {/* Play Now < */}
          </Button>
        </div>
      </Container> {/* Close Container */}
    </Link>
  );
}
