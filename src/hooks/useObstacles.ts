
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback(() => {
    const now = Date.now();
    const obstacleInterval = Math.max(800 - scoreRef.current! / 10, 400); // Decrease interval as score increases
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      console.log('Creating new obstacle');
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
        // If the obstacle is exploding, move it faster
        if (obstacle.isExploding) {
          // Remove if it's far below the screen
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current! * 1.5 };
        }
        // Normal movement for non-exploding obstacles
        return { ...obstacle, y: obstacle.y + speedRef.current! };
      })
      // Filter out null values (removed obstacles)
      .filter(Boolean) as Obstacle[];
  }, [speedRef]);

  const resetObstacleTimer = useCallback(() => {
    lastObstacleTimeRef.current = Date.now();
  }, []);

  return {
    createObstacle,
    updateObstacles,
    resetObstacleTimer
  };
}
