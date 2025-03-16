
import React, { useEffect, useRef, useCallback } from "react";
import useGameState from "@/hooks/useGameState";

interface GameControllerProps {
  playerName: string;
  isMobile: boolean;
  gameOver: boolean;
  onMove: (position: number) => void;
  onShoot: () => void;
  onUpdateGame: () => void;
}

const GameController: React.FC<GameControllerProps> = ({
  playerName,
  isMobile,
  gameOver,
  onMove,
  onShoot,
  onUpdateGame
}) => {
  const frameIdRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const FPS = 60;
  const frameDelay = 1000 / FPS;
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Handle pointer movement for ship control (desktop)
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameContainerRef.current && !gameOver && !isMobile) {
      const containerWidth = gameContainerRef.current.clientWidth;
      const position = (e.clientX / containerWidth) * 100;
      onMove(position);
    }
  }, [gameOver, isMobile, onMove]);

  // Handle clicks/taps to shoot
  const handleClick = useCallback(() => {
    if (!gameOver && playerName) {
      onShoot();
    }
  }, [gameOver, onShoot, playerName]);

  // Optimized game loop with frame rate control
  useEffect(() => {
    if (!playerName) return; // Don't start game until player name is set
    
    const gameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp;
      }
      
      const elapsed = timestamp - lastUpdateRef.current;
      
      if (elapsed > frameDelay) {
        onUpdateGame();
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
  }, [onUpdateGame, playerName]);

  return (
    <div 
      className="w-full h-full relative overflow-hidden touch-none"
      ref={gameContainerRef}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
    >
      {/* The game container is just a div that handles events */}
    </div>
  );
};

export default GameController;
