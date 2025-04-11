"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as Config from "./config";
import { initializeGameState, updateGameLogic, GameState } from "./gameLogic";

const GuardingHopeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [gameState, setGameState] = useState<GameState>(initializeGameState);
  // Input state ref remains useful for immediate capture in event listeners
  const inputStateRef = useRef({ left: false, right: false, shoot: false });

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") inputStateRef.current.left = true;
      if (e.key === "ArrowRight") inputStateRef.current.right = true;
      if (e.key === " ") inputStateRef.current.shoot = true;
      if (e.key === " ") e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") inputStateRef.current.left = false;
      if (e.key === "ArrowRight") inputStateRef.current.right = false;
      if (e.key === " ") inputStateRef.current.shoot = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // --- Game Loop ---
  const gameLoop = useCallback(() => {
    // Update state using the functional form to get the latest state
    setGameState((prevGameState) => {
      // Check if game is over *before* doing any updates for this frame
      if (prevGameState.gameOver) {
        return prevGameState;
      }

      // Capture input for this frame
      const currentInput = { ...inputStateRef.current };

      // --- Handle Input & Direct Updates ---
      const { player, bullets, shootCooldown } = prevGameState;
      player.update(currentInput.left, currentInput.right); // Update player position

      let currentBullets = [...bullets];
      // Restore cooldown decrement
      let currentCooldown = Math.max(0, shootCooldown - 1);
      const shootRequested = currentInput.shoot; // Store the captured value

      // Restore cooldown check
      if (shootRequested && currentCooldown === 0) {
        const createdBullet = player.shoot();
        currentBullets = [...prevGameState.bullets, createdBullet]; // Use prevGameState here
        // Restore cooldown reset
        currentCooldown = Config.SHOOT_COOLDOWN;
      }

      // --- Prepare state for core logic ---
      const stateForLogicUpdate: GameState = {
        ...prevGameState,
        player: player, // Pass player with updated position
        bullets: currentBullets,
        // Pass the *updated* cooldown value
        shootCooldown: currentCooldown,
      };

      // --- Call Core Logic ---
      // updateGameLogic handles spawning, collisions, movement, game over check
      return updateGameLogic(stateForLogicUpdate);
    });

    // Schedule the next frame *before* finishing the current loop iteration.
    // The check for gameOver inside setGameState will prevent updates on the *next* frame.
    animationFrameId.current = requestAnimationFrame(gameLoop);

  }, []); // gameLoop function itself doesn't change

  // --- Start/Stop Game Loop ---
  useEffect(() => {
    // Start the loop
    animationFrameId.current = requestAnimationFrame(gameLoop);

    // Cleanup function
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]); // Runs once on mount

  // --- Rendering ---
  // This useEffect depends on the gameState from useState
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = Config.CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT);

    // Draw game elements from the current state
    gameState.player.draw(ctx);
    // Log bullets array before drawing
    console.log(`[DEBUG] Rendering bullets. Count: ${gameState.bullets.length}`);
    gameState.bullets.forEach((bullet) => bullet.draw(ctx));
    gameState.boxes.forEach((box) => box.draw(ctx));

    // Draw UI
    ctx.fillStyle = Config.TEXT_COLOR;
    ctx.font = Config.TEXT_FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${Config.SCORE_LABEL}${gameState.score}`, 10, 10);
    ctx.fillText(`${Config.LIVES_LABEL}${gameState.lives}`, Config.CANVAS_WIDTH - 100, 10);

    // Draw Title and Instructions (centered)
    ctx.textAlign = 'center';
    ctx.fillText(Config.GAME_TITLE, Config.CANVAS_WIDTH / 2, 20);
    ctx.font = '14px Arial';
    ctx.fillText(Config.INSTRUCTIONS_TEXT, Config.CANVAS_WIDTH / 2, 50);

    // Draw Game Over message
    if (gameState.gameOver) {
      // Stop the loop if game is over (redundant check, but safe)
       if (animationFrameId.current) {
         cancelAnimationFrame(animationFrameId.current);
       }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, Config.CANVAS_WIDTH, Config.CANVAS_HEIGHT);
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'red';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over!', Config.CANVAS_WIDTH / 2, Config.CANVAS_HEIGHT / 2);
      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(`Final Score: ${gameState.score}`, Config.CANVAS_WIDTH / 2, Config.CANVAS_HEIGHT / 2 + 50);
    }

  }, [gameState]); // Re-render whenever gameState changes

  return (
    <canvas
      ref={canvasRef}
      width={Config.CANVAS_WIDTH}
      height={Config.CANVAS_HEIGHT}
      style={{ border: Config.CANVAS_BORDER, backgroundColor: Config.CANVAS_BG_COLOR }}
    />
  );
};

export default GuardingHopeGame;
