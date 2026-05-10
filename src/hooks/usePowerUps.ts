import { useState, useCallback, useRef } from "react";
import { PowerUp, PowerUpType, ActivePowerUp } from "@/types/powerUpTypes";
import { POWER_UP_SPAWN_INTERVAL, POWER_UP_SPEED } from "@/config/powerUps";

let powerUpIdCounter = 0;

export const usePowerUps = () => {
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const lastSpawnTimeRef = useRef<number>(Date.now());

  // Spawn a new power-up
  const spawnPowerUp = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnTimeRef.current < POWER_UP_SPAWN_INTERVAL) return;

    const types = Object.values(PowerUpType);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const x = 20 + Math.random() * 60; // 20-80% across screen

    const newPowerUp: PowerUp = {
      id: powerUpIdCounter++,
      x,
      y: 0,
      type: randomType
    };

    setPowerUps(prev => [...prev, newPowerUp]);
    lastSpawnTimeRef.current = now;
  }, []);

  // Update power-up positions
  const updatePowerUps = useCallback(() => {
    setPowerUps(prev => {
      if (prev.length === 0) return prev;
      return prev
        .map(powerUp => ({ ...powerUp, y: powerUp.y + POWER_UP_SPEED }))
        .filter(powerUp => powerUp.y < 100);
    });

    // Only update active power-ups when something actually expires
    const now = Date.now();
    setActivePowerUps(prev => {
      if (prev.length === 0) return prev;
      const next = prev.filter(ap => ap.expiresAt > now);
      return next.length === prev.length ? prev : next;
    });
  }, []);

  // Activate a power-up
  const activatePowerUp = useCallback((type: PowerUpType, duration: number) => {
    const now = Date.now();
    const expiresAt = now + duration;

    setActivePowerUps(prev => {
      // Remove existing power-up of same type
      const filtered = prev.filter(ap => ap.type !== type);
      return [...filtered, { type, expiresAt }];
    });
  }, []);

  // Check if a power-up is active
  const isPowerUpActive = useCallback((type: PowerUpType): boolean => {
    return activePowerUps.some(ap => ap.type === type);
  }, [activePowerUps]);

  // Remove a power-up by id
  const removePowerUp = useCallback((id: number) => {
    setPowerUps(prev => prev.filter(p => p.id !== id));
  }, []);

  // Reset all power-ups
  const resetPowerUps = useCallback(() => {
    setPowerUps([]);
    setActivePowerUps([]);
    lastSpawnTimeRef.current = Date.now();
  }, []);

  return {
    powerUps,
    activePowerUps,
    spawnPowerUp,
    updatePowerUps,
    activatePowerUp,
    isPowerUpActive,
    removePowerUp,
    resetPowerUps
  };
};
