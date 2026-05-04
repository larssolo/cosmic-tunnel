
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback((spawnRateMultiplier: number = 1) => {
    const now = Date.now();

    // Start with a longer interval and gradually decrease it based on score
    // Even longer base interval for slower obstacle generation at the beginning
    const baseInterval = 1500; // Starting with a longer delay (1.5 seconds)
    const minInterval = 400;   // Minimum interval (fastest spawn rate)
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 8, minInterval) / spawnRateMultiplier;
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      console.log('Creating new obstacle with id:', now);
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: -5, // Start above the visible area
        size: Math.random() * 10 + 5, // Size between 5% and 15% of container
      };
      
      lastObstacleTimeRef.current = now;
      return newObstacle;
    }
    
    return null;
  }, [scoreRef]);

  const updateObstacles = useCallback((obstacles: Obstacle[], slowMotionMultiplier: number = 1.0) => {
    return obstacles
      .map(obstacle => {
        // Calculate the speed factor based on the game's current score
        // Start even slower and gradually increase speed
        const baseSpeed = 0.3; // Start with a slower base speed
        const speedFactor = Math.min(1 + (scoreRef.current! / 3000), 2.5); // More gradual increase, lower max
        
        // If the obstacle is exploding, move it faster
        if (obstacle.isExploding) {
          // Remove if it's far below the screen
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current! * 1.5 * speedFactor * slowMotionMultiplier };
        }
        
        // Normal movement for non-exploding obstacles - start slower, get faster over time
        // Apply slow motion multiplier
        return { ...obstacle, y: obstacle.y + (baseSpeed + speedRef.current! * speedFactor) * slowMotionMultiplier };
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
