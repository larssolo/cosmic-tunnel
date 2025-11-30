
import { useCallback } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";

export function useCollisions() {
  const checkShipCollision = useCallback((
    obstacles: Obstacle[],
    shipPosition: number,
    gameOver: boolean,
    isTunnelMode: boolean = false
  ) => {
    if (gameOver) return false;
    
    const shipY = 85; // Ship position from top (percentage)
    const shipSize = isTunnelMode ? 8 : 12; // Smaller hitbox in tunnel mode for fairness
    
    for (const obstacle of obstacles) {
      if (obstacle.isExploding) continue; // Exploding obstacles don't cause collisions
      
      // Use obstacle's actual x position for collision
      const obstacleX = obstacle.x;
      
      const xDiff = Math.abs(obstacleX - shipPosition);
      const yDiff = Math.abs(obstacle.y - shipY);
      
      // Collision radius based on obstacle size
      const obstacleRadius = obstacle.size / 2;
      const collisionThresholdX = obstacleRadius + shipSize / 2;
      const collisionThresholdY = isTunnelMode ? 6 : 10; // Tighter Y collision in tunnel
      
      if (xDiff <= collisionThresholdX && yDiff <= collisionThresholdY) {
        console.log('Ship collision detected!', { obstacleX, shipPosition, xDiff, yDiff });
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
      
      // For tunnel mode obstacles, use angle to calculate actual position
      let obstacleX = obstacle.x;
      if (obstacle.angle !== undefined) {
        const tunnelRadius = 35;
        const centerX = 50;
        obstacleX = centerX + Math.cos(obstacle.angle) * tunnelRadius;
      }
      
      for (let j = 0; j < newProjectiles.length; j++) {
        const projectile = newProjectiles[j];
        
        // Calculate distance between projectile and obstacle
        const xDiff = Math.abs(obstacleX - projectile.x);
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
