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
  }
];

export const getLevelByScore = (score: number): Level => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].requiredScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

export const getNextLevel = (currentLevel: number): Level | null => {
  if (currentLevel >= LEVELS.length) return null;
  return LEVELS[currentLevel];
};
