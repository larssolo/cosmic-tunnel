
export interface Obstacle {
  id: number;
  x: number;
  y: number;
  size?: number;
  sizeVmin?: number;
  isExploding?: boolean;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
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
