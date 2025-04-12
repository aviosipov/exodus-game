import { WorkerTaskManagerProps, Worker, ResourceLabels } from './types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique worker IDs

// Define a type for the scenario structure, excluding the onComplete function
type ScenarioData = Omit<WorkerTaskManagerProps, 'onComplete'>;

// --- Helper Function to Create Workers ---
const createWorker = (name_he: string, energy = 80, hunger = 20, morale = 70): Worker => ({
  id: uuidv4(),
  name_he,
  energy,
  maxEnergy: 100,
  hunger, // Lower is better
  maxHunger: 100,
  morale, // Higher is better
  maxMorale: 100,
  status: 'idle',
  currentTaskId: null,
  taskProgress: 0,
  taskTimeoutId: null,
});

// --- Shared Resource Labels ---
const standardResourceLabels: ResourceLabels = {
  straw: "תבן",
  food: "אוכל",
  bricks: "לבנים",
  clay: "חימר", // Added from old scenario
  energy: "אנרגיה",
  hunger: "רעב",
  morale: "מורל",
};

// --- Scenario: Brick Making Duty ---
export const brickMakingScenario: ScenarioData = {
  title_he: "מנהל עבודה: ייצור לבנים",
  initialWorkers: [
    createWorker("ראובן", 75, 30, 65),
    createWorker("שמעון", 85, 15, 75),
    createWorker("לוי", 80, 25, 70),
  ],
  initialSharedResources: { straw: 15, food: 10, bricks: 0, clay: 20 }, // Added clay based on old task
  sharedResourceLabels: standardResourceLabels,
  globalTimeLimit_seconds: 180, // 3 minutes
  dailyGoal: { bricks: 25 },
  goalLabels: { bricks: "מכסת לבנים" },
  availableTasks: [
    {
      id: 'gather_straw',
      name_he: 'איסוף תבן',
      description_he: "אסוף תבן מהשדות הסמוכים.",
      duration_seconds: 10,
      cost: { energy: -15, hunger: +5 }, // Worker cost
      outcome: { straw: +5 }, // Shared resource outcome
    },
     {
      id: 'gather_clay', // Kept from old scenario
      name_he: 'איסוף חימר',
      description_he: "אסוף חימר מהנילוס.",
      duration_seconds: 12,
      cost: { energy: -18, hunger: +6 },
      outcome: { clay: +4 },
    },
    {
      id: 'make_bricks',
      name_he: 'ייצור לבנים',
      description_he: "ערבב חימר ותבן ליצירת לבנים.",
      duration_seconds: 15,
      cost: { energy: -25, hunger: +8, morale: -2, straw: -3, clay: -2 }, // Worker & Shared cost
      outcome: { bricks: +5 }, // Shared resource outcome & Goal progress
      requirements: { straw: 3, clay: 2 } // Require materials
    },
    {
      id: 'eat_meal',
      name_he: 'אכול ארוחה',
      description_he: "תן לעובד לאכול להשבת כוחות.",
      duration_seconds: 5,
      cost: { food: -1 }, // Shared resource cost
      outcome: { hunger: -30, morale: +5 }, // Worker outcome
      requirements: { food: 1 }
    },
    {
      id: 'rest_short',
      name_he: 'נוח מעט',
      description_he: "מנוחה קצרה להשבת אנרגיה.",
      duration_seconds: 8,
      cost: {}, // No resource cost, just time
      outcome: { energy: +20, morale: +2 }, // Worker outcome
    },
    {
      id: 'help_friend',
      name_he: 'עזרה לחבר',
      description_he: "עזור לחבר במשימתו הקשה לשפר את מצב הרוח.",
      duration_seconds: 7,
      cost: { energy: -10, hunger: +2 }, // Costs energy, slightly increases hunger
      outcome: { morale: +15, energy: +5 }, // Boosts morale significantly, small energy recovery
      // Availability logic handled in useGameLogic
    },
  ]
};


// --- Scenario: Hardship - No Straw ---
export const hardshipNoStrawScenario: ScenarioData = {
  title_he: "מנהל עבודה: אין תבן!",
  initialWorkers: [
    createWorker("יהודה", 60, 40, 50),
    createWorker("יששכר", 70, 35, 55),
    createWorker("זבולון", 65, 45, 45),
  ],
  initialSharedResources: { straw: 0, food: 5, bricks: 0, clay: 10 }, // Start with no straw
  sharedResourceLabels: standardResourceLabels,
  globalTimeLimit_seconds: 150, // Shorter time, more pressure
  dailyGoal: { bricks: 15 }, // Lower goal due to difficulty
  goalLabels: { bricks: "מכסת לבנים" },
  availableTasks: [
    {
      id: 'gather_straw_difficult',
      name_he: 'חפש תבן (קשה)',
      description_he: "חפש נואשות אחר קש בשדות.",
      duration_seconds: 12,
      cost: { energy: -20, hunger: +8, morale: -5 },
      outcome: { straw: +2 }, // Low yield
    },
     {
      id: 'gather_clay_difficult', // Harder clay gathering
      name_he: 'איסוף חימר (קשה)',
      description_he: "אסוף חימר בתנאים קשים.",
      duration_seconds: 15,
      cost: { energy: -22, hunger: +10, morale: -3 },
      outcome: { clay: +3 }, // Low yield
    },
    {
      id: 'make_bricks_with_straw',
      name_he: 'ייצור לבנים (עם תבן)',
      description_he: "השתמש במעט התבן שאספת.",
      duration_seconds: 18,
      cost: { energy: -30, hunger: +10, morale: -3, straw: -1, clay: -2 }, // High cost, low straw use
      outcome: { bricks: +4 },
      requirements: { straw: 1, clay: 2 }
    },
     {
      id: 'make_bricks_no_straw',
      name_he: 'ייצור לבנים ללא תבן!',
      description_he: "עבודה מפרכת לייצר לבנים רק מחימר.",
      duration_seconds: 25, // Very long
      cost: { energy: -40, hunger: +15, morale: -10, clay: -3 }, // Extremely costly
      outcome: { bricks: +2 }, // Very low output
      requirements: { clay: 3 }
    },
    {
      id: 'eat_scraps',
      name_he: 'אכול שאריות',
      description_he: "חפש מעט מזון כדי לשרוד.",
      duration_seconds: 6,
      cost: { food: -1 },
      outcome: { hunger: -15, morale: +1 }, // Less effective than a meal
      requirements: { food: 1 }
    },
    {
      id: 'rest_minimal',
      name_he: 'נוח לרגע',
      description_he: "מנוחה חטופה ומסוכנת.",
      duration_seconds: 10,
      cost: {},
      outcome: { energy: +15, morale: -1 }, // Resting might even lower morale slightly if conditions are bad
    },
     {
      id: 'find_scraps_food', // From old scenario
      name_he: 'חיפוש שאריות מזון',
      description_he: "חפש מעט מזון כדי לשרוד.",
      duration_seconds: 8,
      cost: { energy: -10, hunger: +3 },
      outcome: { food: +1 },
    }
  ]
};

// Add more scenarios here as needed...
