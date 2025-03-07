
import { useState, useCallback, useEffect, useRef } from "react";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  isExploding?: boolean;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
}

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [speed, setSpeed] = useState(2);
  
  const lastObstacleTimeRef = useRef(Date.now());
  const lastShootTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const speedRef = useRef(2);
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
  }, [score, speed]);

  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setSpeed(2);
    lastObstacleTimeRef.current = Date.now();
    lastShootTimeRef.current = 0;
    scoreRef.current = 0;
    speedRef.current = 2;
  }, []);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const moveShip = useCallback((position: number) => {
    const clampedPosition = Math.max(10, Math.min(90, position));
    setShipPosition(clampedPosition);
  }, []);

  const shootProjectile = useCallback(() => {
    const now = Date.now();
    if (now - lastShootTimeRef.current > 300 && !gameOver) {
      const newProjectile: Projectile = {
        id: now,
        x: shipPosition,
        y: 20,
      };
      
      setProjectiles(prev => [...prev, newProjectile]);
      lastShootTimeRef.current = now;
    }
  }, [shipPosition, gameOver]);

  const createObstacle = useCallback(() => {
    const now = Date.now();
    const obstacleInterval = Math.max(1000 - scoreRef.current / 10, 500); // Decrease interval as score increases
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      console.log('Creating new obstacle');
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: 0, // Start at the top
        size: Math.random() * 10 + 5, // Size between 5% and 15% of container
      };
      
      setObstacles(prev => [...prev, newObstacle]);
      lastObstacleTimeRef.current = now;
    }
  }, []);

  const checkShipCollision = useCallback(() => {
    if (gameOver) return false;
    
    const shipY = 80;
    const shipSize = 10;
    const shipSizeHalf = shipSize / 2;

    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue;
      
      const yDiff = Math.abs(obstacle.y - shipY);
      if (yDiff > 10) continue;
      
      const xDiff = Math.abs(obstacle.x - shipPosition);
      const combinedRadii = (obstacle.size + shipSize) / 2;
      
      if (xDiff > combinedRadii) continue;
      
      const distance = Math.sqrt(
        Math.pow(obstacle.x - shipPosition, 2) + 
        Math.pow(obstacle.y - shipY, 2)
      );
      
      if (distance < combinedRadii) {
        setGameOver(true);
        return true;
      }
    }
    
    return false;
  }, [obstacles, shipPosition, gameOver]);

  const checkProjectileCollisions = useCallback(() => {
    let obstaclesHit = false;
    const updatedObstacles = [...obstacles];
    const newProjectiles = [...projectiles];
    let projectilesToRemove: number[] = [];
    
    for (let i = 0; i < updatedObstacles.length; i++) {
      if (updatedObstacles[i].isExploding) continue;
      
      const obstacle = updatedObstacles[i];
      const obstacleSizeHalf = obstacle.size / 2;
      
      for (let j = 0; j < newProjectiles.length; j++) {
        const projectile = newProjectiles[j];
        
        const xDiff = Math.abs(obstacle.x - projectile.x);
        if (xDiff > obstacleSizeHalf) continue;
        
        const yDiff = Math.abs(obstacle.y - (100 - projectile.y));
        if (yDiff > obstacleSizeHalf) continue;
        
        const distance = Math.sqrt(
          Math.pow(obstacle.x - projectile.x, 2) + 
          Math.pow(obstacle.y - (100 - projectile.y), 2)
        );
        
        if (distance < obstacleSizeHalf) {
          obstaclesHit = true;
          updatedObstacles[i] = { ...obstacle, isExploding: true };
          projectilesToRemove.push(j);
          break;
        }
      }
    }
    
    if (obstaclesHit) {
      setObstacles(updatedObstacles);
      
      if (projectilesToRemove.length > 0) {
        setProjectiles(prev => 
          prev.filter((_, index) => !projectilesToRemove.includes(index))
        );
      }
      
      setScore(prev => prev + 50);
    }
  }, [obstacles, projectiles]);

  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    setScore(prev => prev + 1);
    
    if (scoreRef.current > 0 && scoreRef.current % 500 === 0) {
      setSpeed(prev => Math.min(prev + 0.5, 10));
    }
    
    createObstacle();
    
    const updatedObstacles = obstacles
      .map(obstacle => {
        if (obstacle.isExploding) {
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current };
        }
        return { ...obstacle, y: obstacle.y + speedRef.current };
      })
      .filter(Boolean) as Obstacle[];
    
    const updatedProjectiles = projectiles
      .map(projectile => ({
        ...projectile,
        y: projectile.y + 3
      }))
      .filter(projectile => projectile.y < 100);
    
    setObstacles(updatedObstacles);
    setProjectiles(updatedProjectiles);
    
    checkProjectileCollisions();
    checkShipCollision();
  }, [gameOver, createObstacle, checkProjectileCollisions, checkShipCollision, obstacles, projectiles]);

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
