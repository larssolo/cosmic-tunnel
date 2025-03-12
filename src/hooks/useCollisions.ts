
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
    const shipSize = 12; // Slightly increased ship collision size for better detection
    
    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue; // Exploding obstacles don't cause collisions
      
      // Get the actual obstacle size, whether it's using the old or new size property
      const obstacleSize = obstacle.sizeVmin ? obstacle.sizeVmin * 0.9 : obstacle.size || 10;
      
      // Improved collision detection with slightly larger detection area
      const xDiff = Math.abs(obstacle.x - shipPosition);
      const yDiff = Math.abs(obstacle.y - shipY);
      const combinedRadii = (obstacleSize + shipSize) / 2;
      
      // Slightly more generous collision bounds
      if (xDiff <= combinedRadii && yDiff <= 12) {
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
      // Get the actual obstacle size, whether it's using the old or new size property
      const obstacleSize = obstacle.sizeVmin ? obstacle.sizeVmin * 0.9 : obstacle.size || 10;
      const obstacleSizeHalf = obstacleSize / 2;
      
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
