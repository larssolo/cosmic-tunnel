
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
  // Start with an even lower initial speed
  const [speed, setSpeed] = useState(0.5);
  // Add a score multiplier state that starts at 1
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  
  // Add sound effects
  const { playSound } = useSound();
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
  }, [score, speed, scoreMultiplier]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    // Reset to initial slower speed
    setSpeed(0.5);
    // Reset score multiplier
    setScoreMultiplier(1);
    resetObstacleTimer();
    resetProjectileTimer();
    scoreRef.current = 0;
    speedRef.current = 0.5;
    scoreMultiplierRef.current = 1;
    // Play start game sound
    playSound('start');
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
      // Play shoot sound when firing projectile
      playSound('shoot');
    }
  }, [shipPosition, gameOver, createProjectile, playSound]);

  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    // Use base score increment of 1, multiplied by current multiplier
    setScore(prev => prev + Math.round(1 * scoreMultiplierRef.current));
    
    // More gradual speed increase at less frequent intervals
    // This creates a much smoother and slower progression
    if (scoreRef.current > 0 && scoreRef.current % 500 === 0) {
      setSpeed(prev => Math.min(prev + 0.1, 3.0)); // Smaller increments, lower max
      console.log("Speed increased to:", speedRef.current + 0.1);
      // Play speed increase sound
      playSound('speedUp');
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
      // Play explosion sound when obstacle is hit
      playSound('explosion');
      
      // Increase the score multiplier by 1.2x when hitting a meteor
      setScoreMultiplier(prev => prev * 1.2);
      console.log("Score multiplier increased to:", scoreMultiplierRef.current * 1.2);
      
      // Add bonus points for hitting obstacle (50 base points * current multiplier)
      setScore(prev => prev + Math.round(50 * scoreMultiplierRef.current));
      
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }
    
    // Check if ship collided with an obstacle
    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOver);
    if (shipCollided) {
      console.log("Ship collision detected! Game over.");
      // Play game over sound when ship collides
      playSound('gameOver');
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
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  };
};

export default useGameState;
