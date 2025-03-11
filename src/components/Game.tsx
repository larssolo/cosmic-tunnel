
import React, { useEffect, useRef, useState, useCallback } from "react";
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
  
  // Add state for mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
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
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  } = useGameState();

  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkMobile());
  }, []);

  // Optimize by memoizing handler functions
  const handleDeviceOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.gamma === null) return;
    
    // Calculate position based on device tilt (gamma value)
    const tiltSensitivity = 2; // Adjust sensitivity
    const normalizedGamma = event.gamma * tiltSensitivity;
    const position = 50 + normalizedGamma; // Center (50) + tilt adjustment
    moveShip(position);
  }, [moveShip]);

  // Set up device orientation handler for mobile devices
  useEffect(() => {
    if (!isMobile || gameOver) return;
    
    // Request device orientation permissions on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
          }
        })
        .catch(console.error);
    } else {
      // For non-iOS or older iOS
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, [isMobile, gameOver, handleDeviceOrientation]);
  
  // Set up explosion timer when game over occurs
  useEffect(() => {
    if (gameOver && !explosionComplete) {
      // Clear any existing timer
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
      
      // Set a new timer to mark explosion as complete after animation
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

  // Control ship with touch/mouse - memoized for better performance
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (gameContainerRef.current && !gameOver && !isMobile) {
      const containerWidth = gameContainerRef.current.clientWidth;
      const position = (e.clientX / containerWidth) * 100;
      moveShip(position);
    }
  }, [gameOver, isMobile, moveShip]);

  // Handle clicks/taps to shoot
  const handleClick = useCallback(() => {
    if (!gameOver) {
      shootProjectile();
    }
  }, [gameOver, shootProjectile]);

  // Handle game restart
  const handleRestart = useCallback(() => {
    resetGame();
    setExplosionComplete(false);
  }, [resetGame]);

  // Optimized game loop with frame rate control and RAF throttling
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

  // Reducing excessive logging
  // console.log("Game render - obstacles count:", obstacles.length);

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
        isInvulnerable={isInvulnerable}
      />
      <Obstacles obstacles={obstacles} />
      <Projectiles projectiles={projectiles} />
      <GameUI 
        score={score} 
        gameOver={gameOver && explosionComplete} 
        onRestart={handleRestart} 
        scoreMultiplier={scoreMultiplier}
        meteorHits={meteorHits}
        lives={lives}
        isInvulnerable={isInvulnerable}
      />
    </div>
  );
};

export default Game;
