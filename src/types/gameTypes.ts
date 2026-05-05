
export interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  isExploding?: boolean;
  obstacleType?: 'small' | 'medium' | 'large';
  points?: number;
  angle?: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
}

export interface Boss {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  direction: 1 | -1;
  size: number;
  isExploding?: boolean;
}

export type DimensionType = 'neon_city' | 'lava_zone' | 'ice_field';

export interface Wormhole {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number; // timestamp — age derived at render time, no per-frame setState
}

export interface ActiveDimension {
  type: DimensionType;
  endTime: number; // timestamp when dimension expires — no per-frame setState
}

export interface GameState {
  score: number;
  gameOver: boolean;
  shipPosition: number;
  obstacles: Obstacle[];
  projectiles: Projectile[];
  speed: number;
  meteorHits: number;
  lives: number;
}

export interface HighScore {
  id?: string;
  playerName: string;
  score: number;
  date: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  meteorsHit: number;
  highestLevel: number;
  survivalTime: number;
  date: string;
}

export enum LeaderboardType {
  HIGH_SCORE = 'highScore',
  METEORS = 'meteors',
  SURVIVAL = 'survival',
  LEVEL = 'level'
}
