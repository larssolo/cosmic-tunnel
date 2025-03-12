
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
        x: Math.random() * 80 + 10, // Hold meteorer innenfor 10-90% av skjermbredden
        y: -10, // Start litt høyere opp utenfor skjermen
        sizeVmin: Math.random() * 12 + 10, // Større meteorer: 10-22vmin
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
    
    const baseSpeed = 0.4; // Økt basehastighet
    const speedFactor = Math.min(1 + (score / 4000), 1.8); // Justert hastighetsøkning
    const normalSpeed = baseSpeed + speed * speedFactor;
    const explosionSpeed = speed * 1.5 * speedFactor;
    
    return obstacles
      .map(obstacle => {
        if (obstacle.y > 110) return null;
        
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
