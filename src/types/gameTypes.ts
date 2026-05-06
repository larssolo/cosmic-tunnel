
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

export type BossType = 'crusher' | 'mothership' | 'laser_beast';

export interface Boss {
  id: number;
  type: BossType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  direction: 1 | -1;
  size: number;
  isExploding?: boolean;
  lastAttackAt?: number;
}

export interface BossLaser {
  id: number;
  x: number;       // column
  startedAt: number;
  duration: number; // ms
}

export interface Ufo {
  id: number;
  x: number;
  baseY: number;
  size: number;
  vx: number;        // horizontal velocity (% per frame)
  phase: number;     // sine phase for zigzag y
  spawnedAt: number;
  isExploding?: boolean;
}

export interface UfoBullet {
  id: number;
  x: number;
  y: number;
  vy: number;        // % per frame, downward
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
