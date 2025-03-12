
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
      // Create with the correct type and ensure size is adequate for visibility
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: -5, // Start closer to the visible area
        sizeVmin: Math.random() * 10 + 8, // Size between 8vmin and 18vmin for better visibility
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
    
    // Pre-calculate speed factors - reduce speed slightly for better visibility
    const baseSpeed = 0.2;
    const speedFactor = Math.min(1 + (score / 3000), 2.0);
    const normalSpeed = baseSpeed + speed * speedFactor;
    const explosionSpeed = speed * 1.5 * speedFactor;
    
    return obstacles
      .map(obstacle => {
        // Skip calculations for obstacles that are far below screen
        if (obstacle.y > 110) return null;
        
        // Update position
        if (obstacle.isExploding) {
          obstacle.y = obstacle.y + explosionSpeed;
        } else {
          obstacle.y = obstacle.y + normalSpeed;
        }
        return obstacle;
      })
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
