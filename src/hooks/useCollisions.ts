
import { useCallback } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";

export function useCollisions() {
  const checkShipCollision = useCallback((
    obstacles: Obstacle[],
    shipPosition: number,
    gameOver: boolean
  ) => {
    if (gameOver) return false;
    
    const shipY = 80; // Ship position from bottom
    const shipSize = 12; // Ship collision size
    
    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue;
      
      // Optimize size calculation - cache the result
      const obstacleSize = (obstacle.sizeVmin || obstacle.size || 10) * 0.9;
      
      // Simplified collision detection
      const xDiff = Math.abs(obstacle.x - shipPosition);
      const yDiff = Math.abs(obstacle.y - shipY);
      const combinedRadii = (obstacleSize + shipSize) / 2;
      
      if (xDiff <= combinedRadii && yDiff <= 12) {
        return true;
      }
    }
    
    return false;
  }, []);

  const checkProjectileCollisions = useCallback((
    obstacles: Obstacle[],
    projectiles: Projectile[]
  ) => {
    let obstaclesHit = false;
    const updatedObstacles = [...obstacles];
    const projectilesToRemove: number[] = [];
    
    for (let i = 0; i < updatedObstacles.length; i++) {
      if (updatedObstacles[i].isExploding) continue;
      
      const obstacle = updatedObstacles[i];
      // Optimize size calculation
      const obstacleSize = (obstacle.sizeVmin || obstacle.size || 10) * 0.9;
      const obstacleSizeHalf = obstacleSize / 2;
      
      for (let j = 0; j < projectiles.length; j++) {
        const projectile = projectiles[j];
        
        const xDiff = Math.abs(obstacle.x - projectile.x);
        const yDiff = Math.abs(obstacle.y - (100 - projectile.y));
        
        if (xDiff <= obstacleSizeHalf && yDiff <= obstacleSizeHalf) {
          obstaclesHit = true;
          updatedObstacles[i] = { ...obstacle, isExploding: true };
          projectilesToRemove.push(j);
          break;
        }
      }
    }
    
    const newProjectilesList = projectilesToRemove.length > 0 
      ? projectiles.filter((_, index) => !projectilesToRemove.includes(index))
      : projectiles;
    
    return {
      obstaclesHit,
      updatedObstacles,
      newProjectilesList
    };
  }, []);

  return {
    checkShipCollision,
    checkProjectileCollisions
  };
}
