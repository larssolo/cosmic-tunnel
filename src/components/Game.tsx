
import React, { useEffect, useRef, useState } from "react";
import Tunnel from "./Tunnel";
import Spaceship from "./Spaceship";
import Obstacles from "./Obstacles";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import useGameState from "@/hooks/useGameState";

const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const frameIdRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const FPS = 60;
  const frameDelay = 1000 / FPS;
  
  // Add state to track if the explosion animation is complete
  const [explosionComplete, setExplosionComplete] = useState(false);
  const explosionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { 
    score,
    gameOver,
    shipPosition,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits, // Get the meteor hits count
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  } = useGameState();

  // Set up explosion timer when game over occurs
  useEffect(() => {
    if (gameOver && !explosionComplete) {
      // Clear any existing timer
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
      
      // Set a new timer to mark explosion as complete after animation
      // Making it longer (3500ms) to allow for the enhanced explosion animation
      explosionTimerRef.current = setTimeout(() => {
        setExplosionComplete(true);
      }, 3500);
    }
    
    // Reset explosion state when game restarts
    if (!gameOver) {
      setExplosionComplete(false);
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
        explosionTimerRef.current = null;
      }
    }
    
    // Clean up timer on unmount
    return () => {
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
    };
  }, [gameOver]);

  // Control ship with touch/mouse
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameContainerRef.current && !gameOver) {
      const containerWidth = gameContainerRef.current.clientWidth;
      const position = (e.clientX / containerWidth) * 100;
      moveShip(position);
    }
  };

  // Handle clicks/taps to shoot
  const handleClick = () => {
    if (!gameOver) {
      shootProjectile();
    }
  };

  // Handle game restart
  const handleRestart = () => {
    resetGame();
    setExplosionComplete(false);
  };

  // Optimized game loop with frame rate control
  useEffect(() => {
    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastUpdateRef.current;
      
      if (elapsed > frameDelay) {
        updateGame();
        lastUpdateRef.current = timestamp - (elapsed % frameDelay);
      }
      
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };
    
    frameIdRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [updateGame]);

  console.log("Game render - obstacles count:", obstacles.length);

  return (
    <div 
      ref={gameContainerRef}
      className="relative w-full h-full overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      <Tunnel />
      <Spaceship 
        position={shipPosition} 
        onShoot={shootProjectile} 
        isExploding={gameOver} 
      />
      <Obstacles obstacles={obstacles} />
      <Projectiles projectiles={projectiles} />
      <GameUI 
        score={score} 
        gameOver={gameOver && explosionComplete} 
        onRestart={handleRestart} 
        scoreMultiplier={scoreMultiplier}
        meteorHits={meteorHits} // Pass meteor hits to GameUI
      />
    </div>
  );
};

export default Game;
