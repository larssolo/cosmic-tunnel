
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
        return true;
      }
    }
    
    return false;
  }, []);

  const checkProjectileCollisions = useCallback((
    obstacles: Obstacle[],
    projectiles: Projectile[]
  ) => {
    let hitCount = 0;
    const updatedObstacles = [...obstacles];
    const newProjectiles = [...projectiles];
    const projectilesToRemove: number[] = [];
    const destroyedObstacles: Obstacle[] = [];

    for (let i = 0; i < updatedObstacles.length; i++) {
      if (updatedObstacles[i].isExploding) continue;

      const obstacle = updatedObstacles[i];
      const obstacleSizeHalf = obstacle.size / 2;

      let obstacleX = obstacle.x;
      if (obstacle.angle !== undefined) {
        const tunnelRadius = 35;
        const centerX = 50;
        obstacleX = centerX + Math.cos(obstacle.angle) * tunnelRadius;
      }

      for (let j = 0; j < newProjectiles.length; j++) {
        if (projectilesToRemove.includes(j)) continue;
        const projectile = newProjectiles[j];

        const xDiff = Math.abs(obstacleX - projectile.x);
        const yDiff = Math.abs(obstacle.y - (100 - projectile.y));

        if (xDiff <= obstacleSizeHalf && yDiff <= obstacleSizeHalf) {
          hitCount++;
          updatedObstacles[i] = { ...obstacle, isExploding: true };
          destroyedObstacles.push(updatedObstacles[i]);
          projectilesToRemove.push(j);
          break;
        }
      }
    }

    const newProjectilesList = projectilesToRemove.length > 0
      ? newProjectiles.filter((_, index) => !projectilesToRemove.includes(index))
      : newProjectiles;

    return {
      hitCount,
      obstaclesHit: hitCount > 0,
      updatedObstacles,
      destroyedObstacles,
      newProjectilesList,
    };
  }, []);

  return {
    checkShipCollision,
    checkProjectileCollisions
  };
}
