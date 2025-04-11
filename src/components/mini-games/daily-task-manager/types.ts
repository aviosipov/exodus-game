// Resources structure (energy, time, etc.)
export interface Resources {
  [key: string]: number;
  // Example: energy: 10, time: 8, straw: 5, morale: 100
}

// Display names for resources in Hebrew
export interface ResourceLabels {
  [key: string]: string;
  // Example: energy: "אנרגיה", time: "זמן", straw: "תבן", morale: "מורל צוותי"
}

// Goal structure
export interface DailyGoal {
  [key: string]: number | string;
  // Example: bricks: 15, taskmasterSatisfaction: 'neutral'
}

// Goal display names in Hebrew
export interface GoalLabels {
  [key: string]: string;
  // Example: bricks: "מכסת לבנים", taskmasterSatisfaction: "יחס הנוגש"
}

// Task structure
export interface Task {
  id: string;
  name_he: string;
  cost: Partial<Resources>;
  outcome: Partial<Resources & DailyGoal>;
  description_he?: string;
  requirements?: Partial<Resources & DailyGoal>;
}

// Props for the DailyTaskManager component
export interface DailyTaskManagerProps {
  initialResources: Resources;
  resourceLabels: ResourceLabels;
  dailyGoal: DailyGoal;
  goalLabels: GoalLabels;
  availableTasks: Task[];
  onComplete: (result: GameResult) => void;
  title_he?: string;
}

// Game result passed to callback
export interface GameResult {
  success: boolean;
  finalResources: Resources;
  goalAchievement: {[key: string]: number | string | boolean};
}
