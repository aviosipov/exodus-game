"use client"; // Required for onClick handler

import React from 'react';
import Link from 'next/link';

const MainMenu: React.FC = () => {
  // Removed backgroundImageUrl constant again

  return (
    <div
      dir="rtl"
      // Using ::before pseudo-element for background and overlay
      className="relative flex flex-col items-center justify-center min-h-screen p-8 text-right isolate
                 before:absolute before:inset-0 before:-z-10
                 before:bg-[url('/images/main_menu_bg.png')] before:bg-cover before:bg-center before:bg-no-repeat
                 before:bg-black/30 before:content-['']"
      // Removed inline style and separate overlay div
    >
      {/* Content container - no longer needs relative z-10 as parent uses isolate */}
      <div className="flex flex-col items-center w-full">
        <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-md">יציאת מצרים: הרפתקה אינטראקטיבית</h1> {/* Changed text color */}
        <p className="text-lg text-gray-200 mb-10 drop-shadow-md">נובלה ויזואלית אינטראקטיבית ומרכז פעילויות המבוסס על סיפור יציאת מצרים.</p> {/* Changed text color */}

        {/* Primary Actions */}
        {/* Added bg-opacity for slight transparency on buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 w-full max-w-3xl">
          {/* Button 1: Adventure */}
          <Link href="/adventure" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-green-700 mb-2">הרפתקה</h2>
              <p className="text-gray-700">צאו למסע אינטראקטיבי בעקבות סיפור יציאת מצרים, פרק אחר פרק.</p> {/* Adjusted text color */}
          </div>
        </Link>

          {/* Button 2: Mini-games */}
          <Link href="/mini-games" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-yellow-700 mb-2">מיני-משחקים</h2>
              <p className="text-gray-700">בדקו את הידע והכישורים שלכם עם משחקים קצרים המבוססים על הסיפור.</p> {/* Adjusted text color */}
          </div>
        </Link>

          {/* Button 3: Chat */}
          <Link href="/chat" passHref>
            <div className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">שיחה עם דמות</h2>
              <p className="text-gray-700">שוחחו עם דמויות מהסיפור באמצעות בינה מלאכותית ולמדו את נקודת מבטן.</p> {/* Adjusted text color */}
          </div>
        </Link>

          {/* Button 4: Options */}
          <button
            onClick={() => alert('פתח אפשרויות')} // Placeholder action
            className="bg-white/90 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-right border border-gray-200 w-full backdrop-blur-sm"
          >
            <h2 className="text-2xl font-semibold text-red-700 mb-2">אפשרויות</h2>
            <p className="text-gray-700">התאימו את הגדרות המשחק, כמו עוצמת השמע.</p> {/* Adjusted text color */}
        </button>
        </div> {/* Closing Primary Actions Grid */}

        {/* Secondary/Meta Actions - Removed relative z-10 */}
        <div className="border-t border-gray-400 pt-6 mt-8 w-full max-w-3xl flex flex-wrap justify-center gap-4 text-sm bg-black/20 rounded px-4 py-2 backdrop-blur-sm">
          <Link href="/about" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">אודות</span>
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/edit" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">עריכת תוכן</span>
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/dev-guides" passHref>
            <span className="text-gray-200 hover:text-white cursor-pointer">מדריכים למפתחים</span>
          </Link>
          {/* Removed extra </Link> */}
        </div> {/* Closing Secondary Actions Div */}
      </div> {/* Closing relative z-10 container */}
    </div> /* Closing Main Div */
  );
};

export default MainMenu;
