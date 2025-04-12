import React from 'react';
import Link from 'next/link';
import { gameScenarios } from '@/components/mini-games/daily-task-manager/taskSets';

const MissionSelectionPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-200 p-8 text-gray-800">
      <h1 className="text-4xl font-bold mb-2 text-yellow-900" dir="rtl">
        מנהל עבודה יומי
      </h1>
      <p className="text-lg text-yellow-800 mb-8" dir="rtl">
        נהל צוות עבדים במצרים העתיקה והשלם את המכסה היומית לפני שייגמר הזמן. בחר משימה:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {Object.entries(gameScenarios).map(([key, scenario]) => (
          <Link
            href={`/mini-games/daily-task-manager/${key}`}
            key={key}
            className="block p-6 bg-white/70 rounded-lg shadow-md hover:shadow-lg hover:bg-white transition-all duration-200 ease-in-out border border-yellow-700"
            dir="rtl"
          >
            <h2 className="text-2xl font-semibold text-yellow-800 mb-2">
              {scenario.title_he || 'ללא כותרת'}
            </h2>
            {/* Optional: Add description or image preview later */}
            {/* {scenario.backgroundImageUrl && (
              <img src={scenario.backgroundImageUrl} alt={`${scenario.title_he} preview`} className="w-full h-32 object-cover rounded mb-2"/>
            )} */}
            <p className="text-sm text-gray-600">
              לחץ כאן כדי להתחיל...
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MissionSelectionPage;
