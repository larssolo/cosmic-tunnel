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
    
    for (let i = 0; i < obstacles.length; i++) {
      const obstacle = obstacles[i];
      if (obstacle.isExploding) continue;
      
      const obstacleSize = (obstacle.sizeVmin || obstacle.size || 10);
      
      const xDiff = Math.abs(obstacle.x - shipPosition);
      if (xDiff > obstacleSize + shipSize) continue;
      
      const yDiff = Math.abs(obstacle.y - shipY);
      if (yDiff > 12) continue;
      
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
    if (obstacles.length === 0 || projectiles.length === 0) {
      return { obstaclesHit: false, updatedObstacles: obstacles, newProjectilesList: projectiles };
    }
    
    let obstaclesHit = false;
    const updatedObstacles = [...obstacles];
    const projectilesToRemove: number[] = [];
    
    // Pre-compute projectile positions to avoid recalculation
    const projectilePositions = projectiles.map(p => ({
      id: p.id,
      index: projectiles.indexOf(p),
      x: p.x,
      y: 100 - p.y // Pre-convert to obstacle coordinate system
    }));
    
    for (let i = 0; i < updatedObstacles.length; i++) {
      const obstacle = updatedObstacles[i];
      if (obstacle.isExploding) continue;
      
      // Skip obstacles that are not yet visible
      if (obstacle.y < 0) continue;
      
      // Fast size calculation
      const obstacleSize = (obstacle.sizeVmin || obstacle.size || 10) * 0.9;
      const obstacleSizeHalf = obstacleSize / 2;
      
      for (let j = 0; j < projectilePositions.length; j++) {
        // Skip if projectile already marked for removal
        if (projectilesToRemove.includes(projectilePositions[j].index)) continue;
        
        const projectile = projectilePositions[j];
        
        // Quick bounds check before detailed collision
        const xDiff = Math.abs(obstacle.x - projectile.x);
        if (xDiff > obstacleSizeHalf) continue;
        
        const yDiff = Math.abs(obstacle.y - projectile.y);
        if (yDiff > obstacleSizeHalf) continue;
        
        // Collision detected
        obstaclesHit = true;
        updatedObstacles[i] = { ...obstacle, isExploding: true };
        projectilesToRemove.push(projectile.index);
        break; // Stop checking more projectiles for this obstacle
      }
    }
    
    // Only filter projectiles if needed
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
