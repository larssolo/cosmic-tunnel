
import React, { useEffect, useRef } from "react";
import Tunnel from "./Tunnel";
import Obstacles from "./Obstacles";
import Spaceship from "./Spaceship";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import useGameState from "@/hooks/useGameState";
import { useIsMobile } from "@/hooks/use-mobile";
import PlayerNameDialog from "./PlayerNameDialog";

const Game: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  const {
    score,
    gameOver,
    shipPosition,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits,
    lives,
    isInvulnerable,
    playerName,
    showNameDialog,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    handleNameSubmit
  } = useGameState();

  const isMobile = useIsMobile();

  // Handle mouse/touch movement for ship control
  useEffect(() => {
    if (gameOver) return;

    const handleMove = (clientX: number) => {
      if (!gameContainerRef.current) return;
      
      const rect = gameContainerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const position = (x / rect.width) * 100;
      moveShip(position);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMobile) return; // Skip mouse events on mobile
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      handleMove(e.touches[0].clientX);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      if (!isMobile) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameOver, moveShip, isMobile]);

  // Handle orientation for mobile controls
  useEffect(() => {
    if (!isMobile || gameOver) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null) return;
      
      // Convert gamma (-90 to 90) to position (0 to 100)
      // with a more sensitive range (-30 to 30 maps to 0-100)
      const gamma = Math.max(-30, Math.min(30, e.gamma));
      const position = ((gamma + 30) / 60) * 100;
      moveShip(position);
    };

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isMobile, gameOver, moveShip]);

  // Set up game loop
  useEffect(() => {
    const FPS = 60;
    const frameDelay = 1000 / FPS;

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTimestampRef.current >= frameDelay) {
        updateGame();
        lastTimestampRef.current = timestamp;
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current !== null) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [updateGame]);

  // Handle click/tap to shoot
  const handleShoot = () => {
    if (!gameOver) {
      shootProjectile();
    }
  };

  return (
    <div 
      ref={gameContainerRef}
      className="relative w-full h-full overflow-hidden bg-black"
      onClick={handleShoot}
    >
      {/* Game world */}
      <Tunnel />
      <Obstacles obstacles={obstacles} />
      <Projectiles projectiles={projectiles} />
      <Spaceship position={shipPosition} isInvulnerable={isInvulnerable} isDead={gameOver} />
      
      {/* Game UI */}
      <GameUI 
        score={score}
        gameOver={gameOver}
        onRestart={resetGame}
        scoreMultiplier={scoreMultiplier}
        meteorHits={meteorHits}
        lives={lives}
        isInvulnerable={isInvulnerable}
        playerName={playerName}
      />

      {/* Player name dialog */}
      <PlayerNameDialog 
        open={showNameDialog} 
        onSubmit={handleNameSubmit}
      />
    </div>
  );
};

export default Game;
