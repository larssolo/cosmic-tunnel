import { useState, useCallback, useRef } from "react";
import { Obstacle } from "@/types/gameTypes";

export const useTunnelMode = (scoreRef: React.RefObject<number>) => {
  const [countdownTime, setCountdownTime] = useState(120); // 2 minutes
  const [tunnelActive, setTunnelActive] = useState(false);
  const lastObstacleTimeRef = useRef(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTunnelMode = useCallback(() => {
    setTunnelActive(true);
    setCountdownTime(120);
    
    // Start countdown
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    countdownIntervalRef.current = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTunnelMode = useCallback(() => {
    setTunnelActive(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const createTunnelObstacle = useCallback(() => {
    const now = Date.now();
    const baseInterval = 800;
    const minInterval = 300;
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 10, minInterval);
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      // Determine obstacle size and points (inverted scoring)
      const sizeRoll = Math.random();
      let obstacleType: 'small' | 'medium' | 'large';
      let size: number;
      let points: number;
      
      if (sizeRoll < 0.3) {
        // 30% chance - small rocks (high points)
        obstacleType = 'small';
        size = Math.random() * 3 + 3; // 3-6%
        points = Math.floor(Math.random() * 70 + 80); // 80-150 points
      } else if (sizeRoll < 0.65) {
        // 35% chance - medium rocks
        obstacleType = 'medium';
        size = Math.random() * 4 + 6; // 6-10%
        points = Math.floor(Math.random() * 20 + 30); // 30-50 points
      } else {
        // 35% chance - large rocks (low points)
        obstacleType = 'large';
        size = Math.random() * 6 + 10; // 10-16%
        points = Math.floor(Math.random() * 10 + 10); // 10-20 points
      }
      
      // Random angle for positioning on tunnel perimeter
      const angle = Math.random() * Math.PI * 2;
      
      const newObstacle: Obstacle = {
        id: now,
        x: 50, // Will be calculated based on angle
        y: -10, // Start above visible area
        size,
        obstacleType,
        points,
        angle,
      };
      
      lastObstacleTimeRef.current = now;
      return newObstacle;
    }
    
    return null;
  }, [scoreRef]);

  const updateTunnelObstacles = useCallback((obstacles: Obstacle[], slowMotionMultiplier: number = 1.0) => {
    return obstacles
      .map(obstacle => {
        // Move obstacles down (toward player)
        const speed = 0.8 * slowMotionMultiplier;
        
        if (obstacle.isExploding) {
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + speed * 1.5 };
        }
        
        return { ...obstacle, y: obstacle.y + speed };
      })
      .filter(Boolean) as Obstacle[];
  }, []);

  return {
    countdownTime,
    tunnelActive,
    startTunnelMode,
    stopTunnelMode,
    createTunnelObstacle,
    updateTunnelObstacles,
  };
};
