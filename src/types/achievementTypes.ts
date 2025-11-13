export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export enum AchievementCondition {
  TOTAL_SCORE = 'totalScore',
  METEORS_HIT = 'meteorsHit',
  GAMES_PLAYED = 'gamesPlayed',
  PERFECT_GAME = 'perfectGame',
  SPEED_DEMON = 'speedDemon',
  SURVIVOR = 'survivor',
  POWER_UP_COLLECTOR = 'powerUpCollector',
  UNTOUCHABLE = 'untouchable',
  SHARPSHOOTER = 'sharpshooter',
  MARATHON_RUNNER = 'marathonRunner'
}

export interface GameStats {
  score: number;
  meteorsHit: number;
  survivalTime: number;
  livesLost: number;
  powerUpsCollected: number;
  highestLevel: number;
  perfectGame: boolean;
  consecutiveHits: number;
  timeWithoutHit: number;
}
