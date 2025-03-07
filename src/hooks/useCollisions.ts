
import { useCallback } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";

export function useCollisions() {
  const checkShipCollision = useCallback((
    obstacles: Obstacle[],
    shipPosition: number,
    gameOver: boolean
  ) => {
    if (gameOver) return false;
    
    const shipY = 80;
    const shipSize = 10;
    const shipSizeHalf = shipSize / 2;

    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue;
      
      const yDiff = Math.abs(obstacle.y - shipY);
      if (yDiff > 10) continue;
      
      const xDiff = Math.abs(obstacle.x - shipPosition);
      const combinedRadii = (obstacle.size + shipSize) / 2;
      
      if (xDiff > combinedRadii) continue;
      
      const distance = Math.sqrt(
        Math.pow(obstacle.x - shipPosition, 2) + 
        Math.pow(obstacle.y - shipY, 2)
      );
      
      if (distance < combinedRadii) {
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
    const newProjectiles = [...projectiles];
    let projectilesToRemove: number[] = [];
    
    for (let i = 0; i < updatedObstacles.length; i++) {
      if (updatedObstacles[i].isExploding) continue;
      
      const obstacle = updatedObstacles[i];
      const obstacleSizeHalf = obstacle.size / 2;
      
      for (let j = 0; j < newProjectiles.length; j++) {
        const projectile = newProjectiles[j];
        
        const xDiff = Math.abs(obstacle.x - projectile.x);
        if (xDiff > obstacleSizeHalf) continue;
        
        const yDiff = Math.abs(obstacle.y - (100 - projectile.y));
        if (yDiff > obstacleSizeHalf) continue;
        
        const distance = Math.sqrt(
          Math.pow(obstacle.x - projectile.x, 2) + 
          Math.pow(obstacle.y - (100 - projectile.y), 2)
        );
        
        if (distance < obstacleSizeHalf) {
          obstaclesHit = true;
          updatedObstacles[i] = { ...obstacle, isExploding: true };
          projectilesToRemove.push(j);
          break;
        }
      }
    }
    
    const newProjectilesList = projectilesToRemove.length > 0 
      ? newProjectiles.filter((_, index) => !projectilesToRemove.includes(index))
      : newProjectiles;
    
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
