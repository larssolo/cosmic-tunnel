
import React, { useEffect, useRef, useState } from "react";
import Tunnel from "./Tunnel";
import Spaceship from "./Spaceship";
import Obstacles from "./Obstacles";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import useGameState from "@/hooks/useGameState";

const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
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

  // Control ship with touch/mouse
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameContainerRef.current && !gameOver) {
      const containerWidth = gameContainerRef.current.clientWidth;
      const position = (e.clientX / containerWidth) * 100;
      moveShip(position);
    }
  };

  // Game loop
  useEffect(() => {
    let frameId: number;
    const gameLoop = () => {
      updateGame();
      frameId = requestAnimationFrame(gameLoop);
    };
    
    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [updateGame]);

  return (
    <div 
      ref={gameContainerRef}
      className="relative w-full h-full overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
    >
      <Tunnel />
      <Spaceship position={shipPosition} onShoot={shootProjectile} />
      <Obstacles obstacles={obstacles} />
      <Projectiles projectiles={projectiles} />
      <GameUI score={score} gameOver={gameOver} onRestart={resetGame} />
    </div>
  );
};

export default Game;
