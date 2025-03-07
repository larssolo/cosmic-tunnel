
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  // Start with a lower initial speed
  const [speed, setSpeed] = useState(0.8);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.8);
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
  }, [score, speed]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    // Reset to initial slow speed
    setSpeed(0.8);
    resetObstacleTimer();
    resetProjectileTimer();
    scoreRef.current = 0;
    speedRef.current = 0.8;
  }, [resetObstacleTimer, resetProjectileTimer]);

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
    }
  }, [shipPosition, gameOver, createProjectile]);

  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    setScore(prev => prev + 1);
    
    // Gradually increase speed at more regular intervals
    // This creates a smooth progression
    if (scoreRef.current > 0 && scoreRef.current % 300 === 0) {
      setSpeed(prev => Math.min(prev + 0.2, 5)); // Smaller increments, lower max
      console.log("Speed increased to:", speedRef.current + 0.2);
    }
    
    // Create new obstacle if it's time
    const newObstacle = createObstacle();
    if (newObstacle) {
      console.log("Adding new obstacle to state:", newObstacle.id);
      setObstacles(prev => [...prev, newObstacle]);
    }
    
    // Update obstacles positions
    setObstacles(prev => {
      const updated = updateObstacles(prev);
      console.log("Updated obstacles count:", updated.length);
      return updated;
    });
    
    // Update projectiles positions
    const updatedProjectiles = updateProjectiles(projectiles);
    setProjectiles(updatedProjectiles);
    
    // Check for collisions between projectiles and obstacles
    const { obstaclesHit, updatedObstacles: collidedObstacles, newProjectilesList } = 
      checkProjectileCollisions(obstacles, updatedProjectiles);
    
    if (obstaclesHit) {
      console.log("Obstacle hit by projectile!");
      setScore(prev => prev + 50);
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }
    
    // Check if ship collided with an obstacle
    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOver);
    if (shipCollided) {
      console.log("Ship collision detected! Game over.");
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
    shipPosition
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
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  };
};

export default useGameState;
