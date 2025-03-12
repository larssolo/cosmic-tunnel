
export interface Obstacle {
  id: number;
  x: number;
  y: number;
  size?: number; // Make size optional since we're now using sizeVmin
  sizeVmin?: number; // Add the new size property in vmin units
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
  lives: number; // Added lives counter
}
