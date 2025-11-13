import { PowerUpConfig, PowerUpType } from "@/types/powerUpTypes";

export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  [PowerUpType.SHIELD]: {
    type: PowerUpType.SHIELD,
    name: "Shield",
    description: "5 seconds of invulnerability",
    duration: 5000,
    color: "hsl(210, 100%, 60%)",
    icon: "Shield"
  },
  [PowerUpType.RAPID_FIRE]: {
    type: PowerUpType.RAPID_FIRE,
    name: "Rapid Fire",
    description: "8 seconds of faster shooting",
    duration: 8000,
    color: "hsl(30, 100%, 60%)",
    icon: "Zap"
  },
  [PowerUpType.SLOW_MOTION]: {
    type: PowerUpType.SLOW_MOTION,
    name: "Slow Motion",
    description: "5 seconds of slower obstacles",
    duration: 5000,
    color: "hsl(270, 100%, 60%)",
    icon: "Timer"
  },
  [PowerUpType.SCORE_BOOST]: {
    type: PowerUpType.SCORE_BOOST,
    name: "Score Boost",
    description: "10 seconds of 2x score",
    duration: 10000,
    color: "hsl(45, 100%, 60%)",
    icon: "Star"
  },
  [PowerUpType.HEALTH]: {
    type: PowerUpType.HEALTH,
    name: "Health",
    description: "Restore 1 life",
    duration: 0,
    color: "hsl(120, 100%, 60%)",
    icon: "Heart"
  }
};

export const POWER_UP_SPAWN_INTERVAL = 15000; // 15 seconds - reduced from 20
export const POWER_UP_SPEED = 1.2; // Slightly slower for better visibility
export const POWER_UP_SIZE = 30;
