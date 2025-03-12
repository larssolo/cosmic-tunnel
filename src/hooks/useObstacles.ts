
import { useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export function useObstacles(scoreRef: React.RefObject<number>, speedRef: React.RefObject<number>) {
  const lastObstacleTimeRef = useRef(Date.now());

  const createObstacle = useCallback(() => {
    const now = Date.now();
    
    const baseInterval = 1500;
    const minInterval = 400;
    const obstacleInterval = Math.max(baseInterval - (scoreRef.current || 0) / 8, minInterval);
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      const newObstacle: Obstacle = {
        id: now,
        x: Math.random() * 80 + 10, // Keep x position between 10% and 90% of screen width
        y: -20, // Start above the screen to ensure visibility before entering
        sizeVmin: Math.random() * 10 + 14, // Size between 14-24vmin for better visibility
      };
      
      lastObstacleTimeRef.current = now;
      return newObstacle;
    }
    
    return null;
  }, [scoreRef]);

  const updateObstacles = useCallback((obstacles: Obstacle[]) => {
    if (obstacles.length === 0) return [];
    
    const score = scoreRef.current || 0;
    const speed = speedRef.current || 0.5;
    
    // Enhanced speed calculations for smoother movement
    const baseSpeed = 0.6; // Increased base speed to make meteors more visible
    const speedFactor = Math.min(1 + (score / 10000), 2.0); // More gradual speed increase
    const normalSpeed = baseSpeed * speedFactor;
    const explosionSpeed = normalSpeed * 1.5;
    
    return obstacles
      .map(obstacle => {
        // Remove obstacles when they're far below the screen
        if (obstacle.y > 120) return null;
        
        if (obstacle.isExploding) {
          obstacle.y += explosionSpeed;
        } else {
          obstacle.y += normalSpeed; // Apply speed for normal movement
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
