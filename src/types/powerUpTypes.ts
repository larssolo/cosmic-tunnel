export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
}

export enum PowerUpType {
  SHIELD = 'shield',
  RAPID_FIRE = 'rapidFire',
  SLOW_MOTION = 'slowMotion',
  SCORE_BOOST = 'scoreBoost',
  HEALTH = 'health',
  TRIPLE_SHOT = 'tripleShot'
}

export interface ActivePowerUp {
  type: PowerUpType;
  expiresAt: number;
}

export interface PowerUpConfig {
  type: PowerUpType;
  name: string;
  description: string;
  duration: number;
  color: string;
  icon: string;
}
