
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [speed, setSpeed] = useState(0.5);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [meteorHits, setMeteorHits] = useState(0);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  const meteorHitsRef = useRef(0);
  
  const { playSound } = useSound();
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
    meteorHitsRef.current = meteorHits;
  }, [score, speed, scoreMultiplier, meteorHits]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setSpeed(0.5);
    setScoreMultiplier(1);
    setMeteorHits(0);
    resetObstacleTimer();
    resetProjectileTimer();
    scoreRef.current = 0;
    speedRef.current = 0.5;
    scoreMultiplierRef.current = 1;
    meteorHitsRef.current = 0;
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
    if (shipCollided) {
      console.log("Ship collision detected! Game over.");
      playSound('crash');
      setGameOver(true);
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
    playSound
  ]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return {
    score,
    gameOver,
    shipPosition,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  };
};

export default useGameState;
