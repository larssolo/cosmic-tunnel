
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback(() => {
    const now = Date.now();
    
    // Start with a longer interval and gradually decrease it based on score
    // This makes obstacles appear less frequently at the start and more frequently as score increases
    const baseInterval = 1200; // Starting with a longer delay (1.2 seconds)
    const minInterval = 300;   // Minimum interval (fastest spawn rate)
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 5, minInterval);
    
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

  const updateObstacles = useCallback((obstacles: Obstacle[]) => {
    return obstacles
      .map(obstacle => {
        // Calculate the speed factor based on the game's current score
        // Start slow and gradually increase speed
        const baseSpeed = 0.5; // Start with a slower speed
        const speedFactor = Math.min(1 + (scoreRef.current! / 2000), 3); // Max 3x speed increase
        
        // If the obstacle is exploding, move it faster
        if (obstacle.isExploding) {
          // Remove if it's far below the screen
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current! * 1.5 * speedFactor };
        }
        
        // Normal movement for non-exploding obstacles - start slower, get faster over time
        return { ...obstacle, y: obstacle.y + (baseSpeed + speedRef.current! * speedFactor) };
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
