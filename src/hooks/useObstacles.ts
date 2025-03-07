
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback(() => {
    const now = Date.now();
    const obstacleInterval = Math.max(1000 - scoreRef.current! / 10, 500); // Decrease interval as score increases
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      console.log('Creating new obstacle');
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // 10% to 90% of screen width
        y: 0, // Start at the top
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
        if (obstacle.isExploding) {
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speedRef.current! };
        }
        return { ...obstacle, y: obstacle.y + speedRef.current! };
      })
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
