
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback(() => {
    const now = Date.now();
    
    // Start with a longer interval and gradually decrease it based on score
    const baseInterval = 1500; // Starting with a longer delay (1.5 seconds)
    const minInterval = 400;   // Minimum interval (fastest spawn rate)
    const obstacleInterval = Math.max(baseInterval - (scoreRef.current || 0) / 8, minInterval);
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      // Create with the correct type
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: -5, // Start above the visible area
        sizeVmin: Math.random() * 6 + 4, // Size between 4vmin and 10vmin
      };
      
      lastObstacleTimeRef.current = now;
      return newObstacle;
    }
    
    return null;
  }, [scoreRef]);

  const updateObstacles = useCallback((obstacles: Obstacle[]) => {
    // Early return for empty obstacles array
    if (obstacles.length === 0) return [];
    
    // Minimize object creation and calculations
    const score = scoreRef.current || 0;
    const speed = speedRef.current || 0.5;
    
    // Pre-calculate speed factors
    const baseSpeed = 0.3;
    const speedFactor = Math.min(1 + (score / 3000), 2.5);
    const normalSpeed = baseSpeed + speed * speedFactor;
    const explosionSpeed = speed * 1.5 * speedFactor;
    
    return obstacles
      .map(obstacle => {
        // Skip calculations for obstacles that are far below screen
        if (obstacle.y > 110) return null;
        
        // Use existing object when possible, only create new objects when needed
        // If exploding, move faster
        if (obstacle.isExploding) {
          obstacle.y = obstacle.y + explosionSpeed;
          return obstacle;
        }
        
        // Normal movement for non-exploding obstacles
        obstacle.y = obstacle.y + normalSpeed;
        return obstacle;
      })
      // Filter out null values (removed obstacles)
      .filter(Boolean) as Obstacle[];
  }, [scoreRef, speedRef]);

  const resetObstacleTimer = useCallback(() => {
    lastObstacleTimeRef.current = Date.now();
  }, []);

  return {
    createObstacle,
    updateObstacles,
    resetObstacleTimer
  };
}
