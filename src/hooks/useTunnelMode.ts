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
    // MUCH slower spawn rate for tunnel mode - more manageable
    const baseInterval = 1500; // Was 800, now 1500ms
    const minInterval = 800; // Was 300, now 800ms
    const obstacleInterval = Math.max(baseInterval - scoreRef.current! / 20, minInterval);
    
    if (now - lastObstacleTimeRef.current > obstacleInterval) {
      // Determine obstacle size and points (inverted scoring)
      const sizeRoll = Math.random();
      let obstacleType: 'small' | 'medium' | 'large';
      let size: number;
      let points: number;
      
      if (sizeRoll < 0.25) {
        // 25% chance - small obstacles (high points, hard to hit)
        obstacleType = 'small';
        size = Math.random() * 2 + 4; // 4-6%
        points = Math.floor(Math.random() * 70 + 80); // 80-150 points
      } else if (sizeRoll < 0.6) {
        // 35% chance - medium obstacles
        obstacleType = 'medium';
        size = Math.random() * 3 + 7; // 7-10%
        points = Math.floor(Math.random() * 20 + 30); // 30-50 points
      } else {
        // 40% chance - large obstacles (easier to avoid and hit)
        obstacleType = 'large';
        size = Math.random() * 4 + 10; // 10-14%
        points = Math.floor(Math.random() * 10 + 10); // 10-20 points
      }
      
      // Spawn obstacles in random horizontal positions that make sense
      // They start from top and move down toward the player
      const x = Math.random() * 60 + 20; // 20-80% horizontal range
      
      const newObstacle: Obstacle = {
        id: now,
        x: x, // Actual horizontal position
        y: -10, // Start above visible area
        size,
        obstacleType,
        points,
        angle: Math.random() * Math.PI * 2, // For visual rotation/style only
      };
      
      lastObstacleTimeRef.current = now;
      return newObstacle;
    }
    
    return null;
  }, [scoreRef]);

  const updateTunnelObstacles = useCallback((obstacles: Obstacle[], slowMotionMultiplier: number = 1.0) => {
    return obstacles
      .map(obstacle => {
        // Move obstacles down toward player - SLOWER speed
        const baseSpeed = 0.5 * slowMotionMultiplier; // Was 0.8, now 0.5
        
        if (obstacle.isExploding) {
          // Exploding obstacles continue moving briefly then disappear
          if (obstacle.y > 110) return null;
          return { ...obstacle, y: obstacle.y + baseSpeed * 1.5 };
        }
        
        // Remove obstacles that pass below screen
        if (obstacle.y > 105) return null;
        
        return { ...obstacle, y: obstacle.y + baseSpeed };
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