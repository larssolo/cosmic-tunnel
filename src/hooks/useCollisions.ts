
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
    const shipSize = 10; // Approximate ship size
    
    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue; // Exploding obstacles don't cause collisions
      
      // Simple distance-based collision detection
      const xDiff = Math.abs(obstacle.x - shipPosition);
      const yDiff = Math.abs(obstacle.y - shipY);
      const combinedRadii = (obstacle.size + shipSize) / 2;
      
      if (xDiff <= combinedRadii && yDiff <= 10) {
        console.log('Ship collision detected!');
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
      if (updatedObstacles[i].isExploding) continue; // Skip already exploding obstacles
      
      const obstacle = updatedObstacles[i];
      const obstacleSizeHalf = obstacle.size / 2;
      
      for (let j = 0; j < newProjectiles.length; j++) {
        const projectile = newProjectiles[j];
        
        // Calculate distance between projectile and obstacle
        const xDiff = Math.abs(obstacle.x - projectile.x);
        const yDiff = Math.abs(obstacle.y - (100 - projectile.y)); // Convert projectile y to same coordinate system
        
        // Simple distance-based collision detection
        if (xDiff <= obstacleSizeHalf && yDiff <= obstacleSizeHalf) {
          console.log('Projectile hit obstacle!');
          obstaclesHit = true;
          updatedObstacles[i] = { ...obstacle, isExploding: true };
          projectilesToRemove.push(j);
          break;
        }
      }
    }
    
    // Remove projectiles that hit obstacles
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
