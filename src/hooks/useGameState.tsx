import { useState, useCallback, useEffect } from "react";

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
  const [lastObstacleTime, setLastObstacleTime] = useState(0);
  const [lastShootTime, setLastShootTime] = useState(0);

  // Reset game state
  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setSpeed(2);
    setLastObstacleTime(0);
    setLastShootTime(0);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Move ship
  const moveShip = useCallback((position: number) => {
    // Clamp position between 10-90% to keep ship on screen
    const clampedPosition = Math.max(10, Math.min(90, position));
    setShipPosition(clampedPosition);
  }, []);

  // Shoot projectile
  const shootProjectile = useCallback(() => {
    const now = Date.now();
    // Limit shooting rate (can shoot every 300ms)
    if (now - lastShootTime > 300 && !gameOver) {
      const newProjectile: Projectile = {
        id: now,
        x: shipPosition,
        y: 20, // Start at ship position
      };
      
      setProjectiles(prev => [...prev, newProjectile]);
      setLastShootTime(now);
    }
  }, [lastShootTime, shipPosition, gameOver]);

  // Create new obstacle
  const createObstacle = useCallback(() => {
    const now = Date.now();
    if (now - lastObstacleTime > 1000) { // Create obstacle every second
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // Random position between 10-90%
        y: 0, // Start at top
        size: Math.random() * 10 + 5, // Random size between 5-15%
      };
      
      setObstacles(prev => [...prev, newObstacle]);
      setLastObstacleTime(now);
    }
  }, [lastObstacleTime]);

  // Check ship collision with obstacles
  const checkShipCollision = useCallback(() => {
    // Ship is approximately at y position 80%
    const shipY = 80;
    const shipSize = 10; // Approximate ship size

    for (const obstacle of obstacles) {
      // Only check obstacles near the ship's y position
      if (!obstacle.isExploding && Math.abs(obstacle.y - shipY) < 10) {
        // Simple circle collision detection
        const distance = Math.sqrt(
          Math.pow(obstacle.x - shipPosition, 2) + 
          Math.pow(obstacle.y - shipY, 2)
        );
        
        if (distance < (obstacle.size + shipSize) / 2) {
          setGameOver(true);
          return true;
        }
      }
    }
    
    return false;
  }, [obstacles, shipPosition]);

  // Check projectile collision with obstacles
  const checkProjectileCollisions = useCallback(() => {
    let obstaclesHit = false;
    
    const updatedObstacles = obstacles.map(obstacle => {
      if (obstacle.isExploding) return obstacle;
      
      for (const projectile of projectiles) {
        // Calculate distance between projectile and obstacle
        const distance = Math.sqrt(
          Math.pow(obstacle.x - projectile.x, 2) + 
          Math.pow(obstacle.y - (100 - projectile.y), 2)
        );
        
        // If collision detected
        if (distance < obstacle.size / 2) {
          obstaclesHit = true;
          // Mark obstacle for explosion animation
          return { ...obstacle, isExploding: true };
        }
      }
      return obstacle;
    });
    
    if (obstaclesHit) {
      setObstacles(updatedObstacles);
      // Increase score for hitting obstacles
      setScore(prev => prev + 50);
    }
  }, [obstacles, projectiles]);

  // Update game state
  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    // Increase score
    setScore(prev => prev + 1);
    
    // Increase speed gradually
    if (score > 0 && score % 500 === 0) {
      setSpeed(prev => Math.min(prev + 0.5, 10));
    }
    
    // Create new obstacles
    createObstacle();
    
    // Move and filter obstacles
    setObstacles(prev => {
      // Move obstacles down
      return prev
        .map(obstacle => {
          // If obstacle is exploding, keep it for a short time then remove it
          if (obstacle.isExploding) {
            if (obstacle.y > 110) return null; // Remove when off screen
            return { ...obstacle, y: obstacle.y + speed }; // Keep moving
          }
          return { ...obstacle, y: obstacle.y + speed };
        })
        .filter(Boolean) // Remove null obstacles
        // Remove obstacles that are off screen
        .filter(obstacle => obstacle && obstacle.y < 110) as Obstacle[];
    });
    
    // Move and filter projectiles
    setProjectiles(prev => {
      // Move projectiles up
      return prev
        .map(projectile => ({
          ...projectile,
          y: projectile.y + 3 // Speed of projectiles
        }))
        // Remove projectiles that are off screen
        .filter(projectile => projectile.y < 100);
    });
    
    // Check for collisions
    checkProjectileCollisions();
    checkShipCollision();
  }, [gameOver, score, speed, createObstacle, checkShipCollision, checkProjectileCollisions]);

  // Initialize game
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
