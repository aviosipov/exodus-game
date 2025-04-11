import { DailyTaskManagerProps } from './types';

// Define a type for the scenario structure, excluding the onComplete function
type ScenarioData = Omit<DailyTaskManagerProps, 'onComplete'>;

// --- Scenario: Honored Status (Early Stage) ---
export const honoredStatusScenario: ScenarioData = {
  title_he: "ניהול צוות: בניית אסמים",
  initialResources: { energy: 12, time: 10, food: 5, morale: 100, clay: 10 },
  resourceLabels: { energy: "אנרגיה", time: "זמן", food: "מזון", morale: "מורל צוותי", clay: "חימר" },
  dailyGoal: { storage_built: 20 },
  goalLabels: { storage_built: "יחידות אחסון" },
  availableTasks: [
    {
      id: 'gather_clay',
      name_he: 'איסוף חימר איכותי',
      cost: { energy: -2, time: -2 },
      outcome: { clay: +4 },
      description_he: "אסוף חימר מהנילוס לבניית האסמים."
    },
    {
      id: 'build_storage_unit',
      name_he: 'בניית יחידת אחסון',
      cost: { energy: -4, time: -3, clay: -3 },
      outcome: { storage_built: +5, morale: +2 },
      description_he: "בנה יחידת אחסון לאסמי המלך."
    },
    {
      id: 'team_meal',
      name_he: 'ארוחה משותפת לצוות',
      cost: { time: -1, food: -3 },
      outcome: { energy: +2, morale: +5 },
      description_he: "שפר את מורל הצוות עם ארוחה טובה."
    },
    {
      id: 'plan_work',
      name_he: 'תכנון עבודה יעיל',
      cost: { time: -1 },
      outcome: { morale: +1 }, // Small morale boost for good planning
      description_he: "תכנן את המשימות הבאות לשיפור היעילות."
    }
  ]
};


// --- Scenario: Hard Slavery (Later Stage) ---
export const hardSlaveryScenario: ScenarioData = {
  title_he: "ניהול צוות: מכסת לבנים ללא תבן",
  initialResources: { energy: 8, time: 8, food: 1, morale: 60, straw: 0 }, // Start with no straw
  resourceLabels: { energy: "אנרגיה", time: "זמן", food: "מזון", morale: "מורל צוותי", straw: "תבן" },
  dailyGoal: { bricks: 12 }, // Slightly lower goal due to difficulty
  goalLabels: { bricks: "מכסת לבנים" },
  availableTasks: [
    {
      id: 'gather_straw_difficult',
      name_he: 'איסוף תבן (קשה)',
      cost: { energy: -3, time: -2 },
      outcome: { straw: +3, morale: -5 }, // Gathering is hard and demoralizing now
      description_he: "חפש נואשות אחר תבן בשדות."
    },
    {
      id: 'make_bricks_with_straw',
      name_he: 'ייצור לבנים (עם תבן)',
      cost: { energy: -4, time: -3, straw: -2 }, // Consumes gathered straw
      outcome: { bricks: +4 }, // Slightly less efficient than before maybe
      description_he: "השתמש בתבן שאספת לייצור לבנים."
    },
    {
      id: 'make_bricks_no_straw',
      name_he: 'ייצור לבנים ללא תבן!',
      cost: { energy: -6, time: -4 }, // Very costly
      outcome: { bricks: +2, morale: -10 }, // Low output, high morale cost
      description_he: "עבודה מפרכת לייצר לבנים ללא תבן."
    },
    {
      id: 'rest_team_minimal',
      name_he: 'מנוחה קצרה לצוות',
      cost: { time: -1 },
      outcome: { energy: +1, morale: +2 }, // Minimal rest, small morale boost
      description_he: "תן לצוות לנוח לרגע קט, תוך סיכון."
    },
    {
      id: 'find_scraps',
      name_he: 'חיפוש שאריות מזון',
      cost: { energy: -2, time: -1 },
      outcome: { food: +1 },
      description_he: "חפש מעט מזון כדי לשרוד."
    }
    // Removed haul_stones as focus is on bricks without straw
  ]
};

// Add more scenarios here as needed...
