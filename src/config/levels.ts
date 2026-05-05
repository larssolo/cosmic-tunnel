import { Level } from "@/types/levelTypes";
import { GameMode } from "@/types/gameModeTypes";

export const LEVELS: Level[] = [
  {
    level: 1,
    name: "Asteroid Belt",
    requiredScore: 0,
    speedMultiplier: 1.0,
    obstacleFrequency: 1.0,
    backgroundColor: "hsl(250, 60%, 10%)",
    tunnelColor: "hsl(280, 70%, 50%)",
    unlocked: true
  },
  {
    level: 2,
    name: "Nebula Zone",
    requiredScore: 500,
    speedMultiplier: 1.1,
    obstacleFrequency: 1.05,
    backgroundColor: "hsl(200, 60%, 10%)",
    tunnelColor: "hsl(200, 70%, 50%)",
    unlocked: false
  },
  {
    level: 3,
    name: "Meteor Storm",
    requiredScore: 1500,
    speedMultiplier: 1.2,
    obstacleFrequency: 1.15,
    backgroundColor: "hsl(30, 60%, 10%)",
    tunnelColor: "hsl(30, 70%, 50%)",
    unlocked: false
  },
  {
    level: 4,
    name: "Black Hole Edge",
    requiredScore: 3000,
    speedMultiplier: 1.3,
    obstacleFrequency: 1.25,
    backgroundColor: "hsl(0, 0%, 5%)",
    tunnelColor: "hsl(280, 50%, 40%)",
    unlocked: false
  },
  {
    level: 5,
    name: "Supernova Sector",
    requiredScore: 5000,
    speedMultiplier: 1.4,
    obstacleFrequency: 1.35,
    backgroundColor: "hsl(20, 80%, 10%)",
    tunnelColor: "hsl(20, 90%, 60%)",
    unlocked: false
  },
  {
    level: 6,
    name: "Cyber Wormhole",
    requiredScore: 7500,
    speedMultiplier: 1.9,
    obstacleFrequency: 1.8,
    backgroundColor: "hsl(300, 100%, 5%)",
    tunnelColor: "hsl(180, 100%, 50%)",
    unlocked: false,
    gameMode: GameMode.TUNNEL,
    countdownSeconds: 120
  },
  {
    level: 7,
    name: "Plasma Fields",
    requiredScore: 10000,
    speedMultiplier: 2.1,
    obstacleFrequency: 2.0,
    backgroundColor: "hsl(120, 60%, 8%)",
    tunnelColor: "hsl(120, 70%, 50%)",
    unlocked: false
  },
  {
    level: 8,
    name: "Stellar Graveyard",
    requiredScore: 13000,
    speedMultiplier: 2.3,
    obstacleFrequency: 2.2,
    backgroundColor: "hsl(0, 50%, 8%)",
    tunnelColor: "hsl(0, 60%, 45%)",
    unlocked: false
  },
  {
    level: 9,
    name: "Cosmic Maelstrom",
    requiredScore: 17000,
    speedMultiplier: 2.5,
    obstacleFrequency: 2.5,
    backgroundColor: "hsl(180, 60%, 8%)",
    tunnelColor: "hsl(180, 70%, 50%)",
    unlocked: false
  },
  {
    level: 10,
    name: "Event Horizon",
    requiredScore: 22000,
    speedMultiplier: 2.8,
    obstacleFrequency: 3.0,
    backgroundColor: "hsl(0, 0%, 2%)",
    tunnelColor: "hsl(330, 80%, 55%)",
    unlocked: false
  },
  {
    level: 11,
    name: "Dark Matter Drift",
    requiredScore: 28000,
    speedMultiplier: 3.1,
    obstacleFrequency: 3.3,
    backgroundColor: "hsl(260, 40%, 5%)",
    tunnelColor: "hsl(260, 80%, 60%)",
    unlocked: false
  },
  {
    level: 12,
    name: "Quantum Rift",
    requiredScore: 35000,
    speedMultiplier: 3.4,
    obstacleFrequency: 3.6,
    backgroundColor: "hsl(180, 50%, 4%)",
    tunnelColor: "hsl(180, 100%, 55%)",
    unlocked: false
  },
  {
    level: 13,
    name: "Void Nexus",
    requiredScore: 43000,
    speedMultiplier: 3.7,
    obstacleFrequency: 4.0,
    backgroundColor: "hsl(0, 0%, 1%)",
    tunnelColor: "hsl(300, 100%, 50%)",
    unlocked: false
  },
  {
    level: 14,
    name: "Singularity Edge",
    requiredScore: 52000,
    speedMultiplier: 4.0,
    obstacleFrequency: 4.4,
    backgroundColor: "hsl(30, 60%, 4%)",
    tunnelColor: "hsl(30, 100%, 60%)",
    unlocked: false
  },
  {
    level: 15,
    name: "Cosmic Infinity",
    requiredScore: 62000,
    speedMultiplier: 4.4,
    obstacleFrequency: 4.8,
    backgroundColor: "hsl(200, 80%, 3%)",
    tunnelColor: "hsl(60, 100%, 70%)",
    unlocked: false
  }
];

export const getLevelByScore = (score: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].requiredScore) {
      const base = LEVELS[i];
      // Beyond the last defined level: infinite scaling
      if (i === LEVELS.length - 1 && score > base.requiredScore) {
        const bonus = Math.floor((score - base.requiredScore) / 8000);
        if (bonus > 0) {
          return {
            ...base,
            level: base.level + bonus,
            name: `Sector ${base.level + bonus}`,
            speedMultiplier: Math.min(base.speedMultiplier + bonus * 0.15, 6.0),
            obstacleFrequency: Math.min(base.obstacleFrequency + bonus * 0.2, 7.0),
          };
        }
      }
      return base;
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (currentLevel: number): Level | null => {
  if (currentLevel >= LEVELS.length) return null;
  return LEVELS[currentLevel];
};
