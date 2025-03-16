import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";
import { useShipDamage } from "./useShipDamage";
import { useGameScore } from "./useGameScore";
import { useGameLoop } from "./useGameLoop";

const MAX_LIVES = 3; // Define maximum lives

const useGameState = () => {
  // Core game state
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  
  // Initialize sound system
  const { playSound } = useSound();
  
  // Initialize ship damage and lives system
  const { 
    lives, 
    handleShipHit, 
    resetLives 
  } = useShipDamage(MAX_LIVES, isInvulnerable, setIsInvulnerable, setGameOver, playSound);
  
  // Initialize scoring system
  const { 
    score, 
    speed,
    scoreMultiplier,
    meteorHits,
    increaseScore,
    increaseMeteorHits,
    increaseMultiplier,
    resetScoreSystem
  } = useGameScore(playSound);
  
  // Create refs for passing values to other hooks
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  const meteorHitsRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  
  // Keep refs in sync with state
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
    meteorHitsRef.current = meteorHits;
    livesRef.current = lives;
  }, [score, speed, scoreMultiplier, meteorHits, lives]);

  // Initialize obstacle system
  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  
  // Initialize projectile system
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  
  // Initialize collision detection
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  // Reset all game systems
  const resetGame = useCallback(() => {
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setIsInvulnerable(false);
    
    resetScoreSystem();
    resetLives();
    resetObstacleTimer();
    resetProjectileTimer();
    
    // Reset refs
    scoreRef.current = 0;
    speedRef.current = 0.5;
    scoreMultiplierRef.current = 1;
    meteorHitsRef.current = 0;
    livesRef.current = MAX_LIVES;
    
    playSound('start');
    playSound('atmosphere');
  }, [resetObstacleTimer, resetProjectileTimer, playSound, resetScoreSystem, resetLives]);

  // Start a new game
  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Ship movement handler
  const moveShip = useCallback((position: number) => {
    const clampedPosition = Math.max(10, Math.min(90, position));
    setShipPosition(clampedPosition);
  }, []);

  // Shoot projectile handler
  const shootProjectile = useCallback(() => {
    const newProjectile = createProjectile(shipPosition, gameOver);
    if (newProjectile) {
      setProjectiles(prev => [...prev, newProjectile]);
      playSound('shoot');
    }
  }, [shipPosition, gameOver, createProjectile, playSound]);

  // Main game update loop
  const updateGame = useGameLoop({
    gameOver,
    obstacles,
    projectiles,
    shipPosition,
    scoreMultiplierRef,
    isInvulnerable,
    createObstacle,
    updateObstacles,
    updateProjectiles,
    checkProjectileCollisions,
    checkShipCollision,
    setObstacles,
    setProjectiles,
    handleShipHit,
    increaseScore,
    increaseMeteorHits,
    increaseMultiplier,
    playSound
  });

  // Initialize game on first load
  useEffect(() => {
    startGame();
    playSound('atmosphere');
  }, [startGame, playSound]);

  return {
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
  };
};

export default useGameState;
