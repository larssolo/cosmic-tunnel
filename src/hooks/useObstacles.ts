
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
        x: Math.random() * 80 + 10,
        y: 0,
        sizeVmin: Math.random() * 8 + 8, // Size between 8-16vmin
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
    
    const baseSpeed = 0.5;
    const speedFactor = Math.min(1 + (score / 5000), 2.0);
    const normalSpeed = baseSpeed * speedFactor;
    const explosionSpeed = normalSpeed * 1.5;
    
    return obstacles
      .map(obstacle => {
        if (obstacle.y > 120) return null;
        
        if (obstacle.isExploding) {
          obstacle.y += explosionSpeed;
        } else {
          obstacle.y += normalSpeed;
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
