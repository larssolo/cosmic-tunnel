
import React, { useEffect, useRef, useState, useCallback } from "react";
import Tunnel from "./Tunnel";
import Spaceship from "./Spaceship";
import Obstacles from "./Obstacles";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import HighScoreList from "./HighScoreList";
import PlayerNameDialog from "./PlayerNameDialog";
import useGameState from "@/hooks/useGameState";
import { HighScoreService } from "@/services/HighScoreService";

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
  
  // Add state for player name
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
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
    
    // Try to get previously saved player name
    const savedName = localStorage.getItem("pilotName");
    if (savedName) {
      setPlayerName(savedName);
      setShowNameDialog(false);
    }
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
      setScoreSubmitted(false);
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
  
  // Submit score when game is over
  useEffect(() => {
    if (gameOver && explosionComplete && playerName && !scoreSubmitted && score > 0) {
      const submitScore = async () => {
        try {
          await HighScoreService.addScore(playerName, score);
          setScoreSubmitted(true);
          console.log("Score submitted for:", playerName);
        } catch (error) {
          console.error("Failed to submit score:", error);
        }
      };
      
      submitScore();
    }
  }, [gameOver, explosionComplete, playerName, score, scoreSubmitted]);

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
    if (!gameOver && playerName) {
      shootProjectile();
    }
  }, [gameOver, shootProjectile, playerName]);

  // Handle game restart
  const handleRestart = useCallback(() => {
    resetGame();
    setExplosionComplete(false);
    setScoreSubmitted(false);
  }, [resetGame]);
  
  // Handle player name submission
  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem("pilotName", name);
    setShowNameDialog(false);
  }, []);

  // Optimized game loop with frame rate control and RAF throttling
  useEffect(() => {
    if (!playerName) return; // Don't start game until player name is set
    
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
  }, [updateGame, playerName]);

  return (
    <div className="relative w-full h-full flex md:flex-row flex-col">
      {/* Game area */}
      <div className="flex-1 relative overflow-hidden touch-none"
           ref={gameContainerRef}
           onPointerMove={handlePointerMove}
           onClick={handleClick}>
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
          playerName={playerName}
        />
      </div>
      
      {/* High scores area */}
      <div className="md:w-80 md:h-full w-full md:max-h-none max-h-48 bg-black/30 border-l border-purple-500/20 p-4 overflow-auto backdrop-blur-sm">
        <HighScoreList />
      </div>
      
      {/* Player name dialog */}
      <PlayerNameDialog 
        open={showNameDialog} 
        onSubmit={handleNameSubmit} 
      />
    </div>
  );
};

export default Game;
