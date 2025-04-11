export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Player Config
export const PLAYER_WIDTH = 50; // Slightly wider for easier collection
export const PLAYER_HEIGHT = 20;
export const PLAYER_COLOR = '#3498db'; // Represents Hope/Faith
export const PLAYER_SPEED = 3; // Reduced speed
export const PLAYER_Y_POSITION = CANVAS_HEIGHT - 40;
export const PLAYER_LIVES = 3;
// Box Config (Replaces Enemy)
export const BOX_DESCENT_SPEED = 0.75; // Reduced speed
export const BOX_WIDTH = 120; // Wider to fit Hebrew text
export const BOX_HEIGHT = 40;
export const POSITIVE_BOX_COLOR = '#2ecc71'; // Green for positive
export const NEGATIVE_BOX_COLOR = '#e74c3c'; // Red for negative
export const BOX_SPAWN_RATE = 120; // Frames between new box spawns (adjust for difficulty)
export const POSITIVE_BOX_RATIO = 0.35; // ~35% chance a spawned box is positive

// Word Lists (Parameterizable) - Stage 3 Example
export const POSITIVE_WORDS = [
  'תקווה', // Hope
  'אמונה', // Faith
  'גאולה', // Redemption
  'חירות', // Freedom
  'ברכה', // Blessing
  'תורה', // Torah
  'ישועה', // Salvation
  'הבטחה', // Promise
  'זכור', // Remember
  'נחמה', // Consolation
];
export const NEGATIVE_WORDS = [
  'עבודת פרך', // Hard Labor
  'שעבוד', // Bondage
  'גזירות פרעה', // Pharaoh's Decrees
  'נוגש', // Taskmaster
  'ייאוש', // Despair
  'מצרים', // Egypt/Hardship
  'קושי', // Difficulty
  'צרה', // Trouble
  'מרור', // Bitterness
  'ייסורים', // Suffering
  'מכה', // Plague/Blow
  'מוות', // Death
];

// Scoring & Penalties
export const SCORE_HIT_NEGATIVE = 10;
export const SCORE_PENALTY_HIT_POSITIVE = -50;
export const SCORE_BONUS_COLLECT_POSITIVE = 25; // For player touching positive box
export const SCORE_BONUS_POSITIVE_REACH_BOTTOM = 15; // Alternative/additional bonus if it reaches bottom safely
export const SCORE_PENALTY_NEGATIVE_REACH_BOTTOM = -5; // Minor penalty if negative reaches bottom

// Bullet Config
export const BULLET_WIDTH = 5;
export const BULLET_HEIGHT = 15;
export const BULLET_COLOR = '#f1c40f'; // Gold/Light
export const BULLET_SPEED = -7; // Negative for upward movement
export const BULLET_TTL = 90; // Frames before bullet disappears if it hits nothing
export const SHOOT_COOLDOWN = 20; // Frames between shots

// Style & UI Config
export const CANVAS_BG_COLOR = '#1a1a2e'; // Darker, more thematic background
export const CANVAS_BORDER = '1px solid #4a4a7f';
export const TEXT_FONT = 'bold 18px Arial'; // Ensure Hebrew characters render well
export const TEXT_COLOR = 'white';
export const GAME_TITLE = 'שמירה על התקווה'; // Guarding Hope (Hebrew)
export const INSTRUCTIONS_TEXT = 'פגע באדום! אסוף את הירוק!'; // Hit Red! Collect Green! (Hebrew)
export const SCORE_LABEL = 'ניקוד: '; // Score:
export const LIVES_LABEL = 'חיים: '; // Lives:
