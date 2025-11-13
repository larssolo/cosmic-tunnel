export interface Level {
  level: number;
  name: string;
  requiredScore: number;
  speedMultiplier: number;
  obstacleFrequency: number;
  backgroundColor: string;
  tunnelColor: string;
  unlocked: boolean;
}

export interface LevelProgress {
  currentLevel: number;
  highestLevelReached: number;
}
