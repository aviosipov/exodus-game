import * as Config from './config';
import { Player } from './player';
import { Bullet } from './bullet';
import { Box, createRandomBox } from './enemy';

// Basic collision detection (Axis-Aligned Bounding Box)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collides(rect1: any, rect2: any): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export interface GameState {
  player: Player;
  bullets: Bullet[];
  boxes: Box[];
  score: number;
  lives: number;
  gameOver: boolean;
  frameCount: number; // To time box spawns
  shootCooldown: number;
}

export function initializeGameState(): GameState {
  return {
    player: new Player(),
    bullets: [],
    boxes: [],
    score: 0,
    lives: Config.PLAYER_LIVES,
    gameOver: false,
    frameCount: 0,
    shootCooldown: 0,
  };
}

// Corrected updateGameLogic - no inputState parameter
export function updateGameLogic(currentState: GameState): GameState {
  // Destructure state passed in (potentially updated by the component loop)
  const { player, bullets, boxes, score, lives, frameCount, shootCooldown, gameOver } = currentState;

  // If game is over, return immediately
  if (gameOver) {
    return currentState;
  }

  let newScore = score;
  let newLives = lives;
  let newGameOver = false; // Assume not game over

  // --- Update Frame Count ---
  const newFrameCount = frameCount + 1;
  // Cooldown is handled *before* calling this function now

  // --- Update Bullets (already passed in potentially updated) ---
  let updatedBullets = [...bullets]; // Use the bullets passed into the function
  updatedBullets.forEach((bullet) => bullet.update());
  updatedBullets = updatedBullets.filter((bullet) => bullet.active);

  // --- Spawn New Boxes ---
  let updatedBoxes = [...boxes];
  if (newFrameCount % Config.BOX_SPAWN_RATE === 0) {
    updatedBoxes.push(createRandomBox());
  }

  // --- Update Boxes ---
  updatedBoxes.forEach((box) => box.update());

  // --- Collision Detection: Bullets vs Boxes ---
  for (let i = updatedBullets.length - 1; i >= 0; i--) {
    const bullet = updatedBullets[i];
    if (!bullet.active) continue;
    for (let j = updatedBoxes.length - 1; j >= 0; j--) {
      const box = updatedBoxes[j];
      if (!box.active) continue;
      if (collides(bullet, box)) {
        if (box.type === 'negative') {
          newScore += Config.SCORE_HIT_NEGATIVE;
        } else { // Hit positive box
          newScore += Config.SCORE_PENALTY_HIT_POSITIVE;
          // Optional: Add life penalty for hitting positive
          // newLives -= 1;
        }
        box.active = false; // Deactivate box
        bullet.active = false; // Deactivate bullet
        break; // Bullet can only hit one box
      }
    }
  }

  // --- Collision Detection: Player vs Boxes ---
  // IMPORTANT: Player object state (position) was updated outside this function
  for (let j = updatedBoxes.length - 1; j >= 0; j--) {
    const box = updatedBoxes[j];
    if (!box.active) continue;
    if (collides(player, box)) {
      if (box.type === 'positive') {
        newScore += Config.SCORE_BONUS_COLLECT_POSITIVE; // Collect positive
      } else { // Hit negative box
        newLives -= 1; // Lose a life
      }
      box.active = false; // Deactivate box regardless of type
    }
  }

  // --- Handle Boxes Reaching Bottom ---
  for (let j = updatedBoxes.length - 1; j >= 0; j--) {
      const box = updatedBoxes[j];
      if (!box.active) continue; // Already handled or off-screen
      if (box.y >= Config.CANVAS_HEIGHT) {
          if (box.type === 'positive') {
              // Optional: Award points if positive reaches bottom safely (if not collected)
              // newScore += Config.SCORE_BONUS_POSITIVE_REACH_BOTTOM;
          } else { // Negative box reached bottom
              newScore += Config.SCORE_PENALTY_NEGATIVE_REACH_BOTTOM;
              // Optional: Lose a life if negative reaches bottom
              // newLives -= 1;
          }
          box.active = false; // Deactivate box
      }
  }

  // --- Cleanup Inactive Objects ---
  updatedBullets = updatedBullets.filter((bullet) => bullet.active);
  updatedBoxes = updatedBoxes.filter((box) => box.active);

  // --- Check Game Over ---
  if (newLives <= 0) {
    newGameOver = true; // Set game over flag
    newLives = 0; // Ensure lives don't go negative
  }

  // --- Return Updated State ---
  return {
    // Return the state with updated values
    player, // Player object reference (updated outside)
    bullets: updatedBullets,
    boxes: updatedBoxes,
    score: newScore,
    lives: newLives,
    gameOver: newGameOver, // Pass the calculated game over state
    frameCount: newFrameCount,
    shootCooldown: shootCooldown, // Pass the cooldown value (decremented/reset outside)
  };
}
