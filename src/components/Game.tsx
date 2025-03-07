
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
  
  const { 
    score,
    gameOver,
    shipPosition,
    obstacles,
    projectiles,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  } = useGameState();

  useEffect(() => {
    console.log('Current obstacles:', obstacles.length);
  }, [obstacles]);

  // Control ship with touch/mouse
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameContainerRef.current && !gameOver) {
      const containerWidth = gameContainerRef.current.clientWidth;
      const position = (e.clientX / containerWidth) * 100;
      moveShip(position);
    }
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

  return (
    <div 
      ref={gameContainerRef}
      className="relative w-full h-full overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
    >
      <Tunnel />
      <Spaceship position={shipPosition} onShoot={shootProjectile} />
      {obstacles && obstacles.length > 0 && <Obstacles obstacles={obstacles} />}
      <Projectiles projectiles={projectiles} />
      <GameUI score={score} gameOver={gameOver} onRestart={resetGame} />
    </div>
  );
};

export default Game;
