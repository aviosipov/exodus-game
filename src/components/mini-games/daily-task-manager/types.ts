// Individual worker structure
export interface Worker {
  id: string;
  name_he: string;
  energy: number;
  maxEnergy: number;
  hunger: number; // Lower is better, increases over time/work
  maxHunger: number;
  morale: number; // Higher is better
  maxMorale: number;
  status: 'idle' | 'working' | 'resting' | 'eating';
  currentTaskId: string | null; // ID of the task being performed
  taskProgress?: number; // Optional: 0-100 for visual progress
  taskTimeoutId?: NodeJS.Timeout | null; // Optional: Store task timer
}

// Shared resources structure (materials like straw, food, bricks)
export interface SharedResources {
  [key: string]: number;
  // Example: straw: 10, food: 5, bricks: 0
}

// Display names for resources and worker stats in Hebrew
export interface ResourceLabels {
  [key: string]: string;
  // Example: straw: "תבן", food: "אוכל", bricks: "לבנים", energy: "אנרגיה", hunger: "רעב", morale: "מורל"
}

// Goal structure (remains similar, focuses on production)
export interface DailyGoal {
  [key: string]: number | string;
  // Example: bricks: 30
}

// Goal display names in Hebrew (remains similar)
export interface GoalLabels {
  [key: string]: string;
  // Example: bricks: "מכסת לבנים"
}

// Updated Task structure
export interface Task {
  id: string;
  name_he: string;
  description_he?: string;
  duration_seconds: number; // Time it takes a worker to complete
  cost: { // Costs can include worker stats and shared resources
    energy?: number; // Worker energy cost (negative value)
    hunger?: number; // Hunger increase (positive value)
    morale?: number; // Morale change (negative or positive)
    [sharedResourceKey: string]: number | undefined; // e.g., straw: -2 (material cost)
  };
  outcome: { // Outcomes can affect worker stats, shared resources, and goals
    energy?: number; // Worker energy gain (positive value, e.g., from rest)
    hunger?: number; // Hunger decrease (negative value, e.g., from eating)
    morale?: number; // Morale change (positive or negative)
    [sharedResourceOrGoalKey: string]: number | string | undefined; // e.g., bricks: +5 (material gain), goal_progress_key: +5
  };
  requirements?: Partial<SharedResources & DailyGoal>; // Optional requirements (e.g., need certain amount of straw)
}

// Renamed and updated Props for the WorkerTaskManager component
export interface WorkerTaskManagerProps {
  initialWorkers: Worker[];
  initialSharedResources: SharedResources;
  sharedResourceLabels: ResourceLabels; // Labels for Straw, Food etc. AND worker stats if needed
  dailyGoal: DailyGoal;
  goalLabels: GoalLabels;
  availableTasks: Task[];
  globalTimeLimit_seconds: number;
  onComplete: (result: GameResult) => void;
  title_he?: string;
  backgroundImageUrl?: string; // Optional: URL for the scenario-specific background
}

// Updated Game result passed to callback
export interface GameResult {
  success: boolean;
  finalSharedResources: SharedResources;
  finalWorkers?: Worker[]; // Optional: include final worker states
  goalAchievement: { [key: string]: number | string | boolean }; // Status per goal key
}
