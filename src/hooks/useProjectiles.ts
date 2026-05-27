
import { useCallback, useRef } from "react";
import { Projectile } from "@/types/gameTypes";

export function useProjectiles() {
  const lastShootTimeRef = useRef(0);

  const createProjectile = useCallback((
    shipPosition: number,
    gameOver: boolean,
    rapidFire: boolean = false,
    tripleShot: boolean = false
  ): Projectile | Projectile[] | null => {
    const now = Date.now();
    const shootInterval = rapidFire ? 150 : 200;
    if (now - lastShootTimeRef.current > shootInterval && !gameOver) {
      lastShootTimeRef.current = now;
      if (tripleShot) {
        return [
          { id: now,     x: shipPosition - 6, y: 20 },
          { id: now + 1, x: shipPosition,      y: 20 },
          { id: now + 2, x: shipPosition + 6,  y: 20 },
        ];
      }
      return { id: now, x: shipPosition, y: 20 };
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
