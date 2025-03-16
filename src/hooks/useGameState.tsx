
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";

const MAX_LIVES = 3; // Define maximum lives

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [speed, setSpeed] = useState(0.5);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [meteorHits, setMeteorHits] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES); // Initialize with maximum lives
  const [isInvulnerable, setIsInvulnerable] = useState(false); // Add invulnerability state
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  const meteorHitsRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  
  const { playSound } = useSound();
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
    meteorHitsRef.current = meteorHits;
    livesRef.current = lives;
  }, [score, speed, scoreMultiplier, meteorHits, lives]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  // Handle ship being hit
  const handleShipHit = useCallback(() => {
    if (isInvulnerable) return;
    
    setLives(prev => prev - 1);
    if (livesRef.current - 1 <= 0) {
      // Game over when no lives left
      setGameOver(true);
      playSound('crash');
    } else {
      // Set temporary invulnerability
      setIsInvulnerable(true);
      playSound('crash');
      
      // Reset invulnerability after 2 seconds
      setTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);
    }
  }, [isInvulnerable, playSound]);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setSpeed(0.5);
    setScoreMultiplier(1);
    setMeteorHits(0);
    setLives(MAX_LIVES); // Reset lives to maximum
    setIsInvulnerable(false); // Reset invulnerability
    resetObstacleTimer();
    resetProjectileTimer();
    scoreRef.current = 0;
    speedRef.current = 0.5;
    scoreMultiplierRef.current = 1;
    meteorHitsRef.current = 0;
    livesRef.current = MAX_LIVES;
    playSound('start');
    playSound('atmosphere'); // Play atmospheric sound when game is reset
  }, [resetObstacleTimer, resetProjectileTimer, playSound]);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const moveShip = useCallback((position: number) => {
    const clampedPosition = Math.max(10, Math.min(90, position));
    setShipPosition(clampedPosition);
  }, []);

  const shootProjectile = useCallback(() => {
    const newProjectile = createProjectile(shipPosition, gameOver);
    if (newProjectile) {
      setProjectiles(prev => [...prev, newProjectile]);
      playSound('shoot');
    }
  }, [shipPosition, gameOver, createProjectile, playSound]);

  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    setScore(prev => prev + Math.round(1 * scoreMultiplierRef.current));
    
    if (scoreRef.current > 0 && scoreRef.current % 500 === 0) {
      setSpeed(prev => Math.min(prev + 0.1, 3.0));
      console.log("Speed increased to:", speedRef.current + 0.1);
      playSound('speedUp');
    }
    
    const newObstacle = createObstacle();
    if (newObstacle) {
      console.log("Adding new obstacle to state:", newObstacle.id);
      setObstacles(prev => [...prev, newObstacle]);
    }
    
    setObstacles(prev => {
      const updated = updateObstacles(prev);
      console.log("Updated obstacles count:", updated.length);
      return updated;
    });
    
    const updatedProjectiles = updateProjectiles(projectiles);
    setProjectiles(updatedProjectiles);
    
    const { obstaclesHit, updatedObstacles: collidedObstacles, newProjectilesList } = 
      checkProjectileCollisions(obstacles, updatedProjectiles);
    
    if (obstaclesHit) {
      console.log("Obstacle hit by projectile!");
      playSound('explosion');
      playSound('rumble');
      setMeteorHits(prev => prev + 1);
      setScoreMultiplier(prev => prev * 1.2);
      console.log("Score multiplier increased to:", scoreMultiplierRef.current * 1.2);
      console.log("Meteor hits:", meteorHitsRef.current + 1);
      setScore(prev => prev + Math.round(50 * scoreMultiplierRef.current));
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }
    
    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOver);
    if (shipCollided && !isInvulnerable) {
      console.log("Ship collision detected!");
      handleShipHit();
    }
  }, [
    gameOver, 
    createObstacle, 
    updateObstacles, 
    updateProjectiles, 
    checkProjectileCollisions, 
    checkShipCollision, 
    obstacles, 
    projectiles, 
    shipPosition,
    playSound,
    isInvulnerable,
    handleShipHit
  ]);

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
