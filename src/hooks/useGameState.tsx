import { useState, useCallback, useEffect } from "react";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
}

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [speed, setSpeed] = useState(2);
  const [lastObstacleTime, setLastObstacleTime] = useState(0);

  // Reset game state
  const resetGame = useCallback(() => {
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setSpeed(2);
    setLastObstacleTime(0);
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

  // Check collision
  const checkCollision = useCallback(() => {
    // Ship is approximately at y position 80%
    const shipY = 80;
    const shipSize = 10; // Approximate ship size

    for (const obstacle of obstacles) {
      // Only check obstacles near the ship's y position
      if (Math.abs(obstacle.y - shipY) < 10) {
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
    
    // Move obstacles
    setObstacles(prev => {
      // Move obstacles down
      const updated = prev
        .map(obstacle => ({
          ...obstacle,
          y: obstacle.y + speed
        }))
        // Remove obstacles that are off screen
        .filter(obstacle => obstacle.y < 110);
      
      return updated;
    });
    
    // Check for collisions
    checkCollision();
  }, [gameOver, score, speed, createObstacle, checkCollision]);

  // Initialize game
  useEffect(() => {
    startGame();
  }, [startGame]);

  return {
    score,
    gameOver,
    shipPosition,
    obstacles,
    startGame,
    resetGame,
    moveShip,
    updateGame
  };
};

export default useGameState;
