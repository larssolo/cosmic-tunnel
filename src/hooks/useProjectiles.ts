
import { useCallback, useRef } from "react";
import { Projectile } from "@/types/gameTypes";

export function useProjectiles() {
  const lastShootTimeRef = useRef(0);

  const createProjectile = useCallback((shipPosition: number, gameOver: boolean) => {
    const now = Date.now();
    if (now - lastShootTimeRef.current > 300 && !gameOver) {
      const newProjectile: Projectile = {
        id: now,
        x: shipPosition,
        y: 20,
      };
      
      lastShootTimeRef.current = now;
      return newProjectile;
    }
    
    return null;
  }, []);

  const updateProjectiles = useCallback((projectiles: Projectile[]) => {
    return projectiles
      .map(projectile => ({
        ...projectile,
        y: projectile.y + 3
      }))
      .filter(projectile => projectile.y < 100);
  }, []);

  const resetProjectileTimer = useCallback(() => {
    lastShootTimeRef.current = 0;
  }, []);

  return {
    createProjectile,
    updateProjectiles,
    resetProjectileTimer
  };
}
