import { GameMode } from "./gameModeTypes";

export interface Level {
  level: number;
  name: string;
  requiredScore: number;
  speedMultiplier: number;
  obstacleFrequency: number;
  backgroundColor: string;
  tunnelColor: string;
  unlocked: boolean;
  gameMode?: GameMode;
  countdownSeconds?: number;
}

export interface LevelProgress {
  currentLevel: number;
  highestLevelReached: number;
}
