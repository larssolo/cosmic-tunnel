
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback((spawnRateMultiplier: number = 1, existingObstacles: Obstacle[] = []) => {
    const now = Date.now();

    const baseInterval = 1500;
    const minInterval = 380; // raised — prevents wall of meteors even during storm
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 6, minInterval) / spawnRateMultiplier;

    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      const size = Math.random() * 10 + 5;

      // Pick an x that doesn't overlap with meteors near the top of the screen
      const topObstacles = existingObstacles.filter(o => o.y < 15 && !o.isExploding);
      let x = Math.random() * 80 + 10;
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = Math.random() * 80 + 10;
        const tooClose = topObstacles.some(o => Math.abs(o.x - candidate) < (o.size / 2 + size / 2 + 4));
        if (!tooClose) { x = candidate; break; }
      }

      lastObstacleTimeRef.current = now;
      return { id: now, x, y: -5, size } as Obstacle;
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
        
        // Remove once off the bottom of the screen
        const newY = obstacle.y + (baseSpeed + speedRef.current! * speedFactor) * slowMotionMultiplier;
        if (newY > 105) return null;
        return { ...obstacle, y: newY };
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
