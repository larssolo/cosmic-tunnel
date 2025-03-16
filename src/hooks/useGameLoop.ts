
import { useCallback } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";

interface GameLoopProps {
  gameOver: boolean;
  obstacles: Obstacle[];
  projectiles: Projectile[];
  shipPosition: number;
  scoreMultiplierRef: React.RefObject<number>;
  isInvulnerable: boolean;
  createObstacle: () => Obstacle | null;
  updateObstacles: (obstacles: Obstacle[]) => Obstacle[];
  updateProjectiles: (projectiles: Projectile[]) => Projectile[];
  checkProjectileCollisions: (obstacles: Obstacle[], projectiles: Projectile[]) => {
    obstaclesHit: boolean;
    updatedObstacles: Obstacle[];
    newProjectilesList: Projectile[];
  };
  checkShipCollision: (obstacles: Obstacle[], shipPosition: number, gameOver: boolean) => boolean;
  setObstacles: React.Dispatch<React.SetStateAction<Obstacle[]>>;
  setProjectiles: React.Dispatch<React.SetStateAction<Projectile[]>>;
  handleShipHit: () => void;
  increaseScore: (amount?: number) => void;
  increaseMeteorHits: () => void;
  increaseMultiplier: () => void;
  playSound: (type: string) => void;
}

export function useGameLoop({
  gameOver,
  obstacles,
  projectiles,
  shipPosition,
  scoreMultiplierRef,
  isInvulnerable,
  createObstacle,
  updateObstacles,
  updateProjectiles,
  checkProjectileCollisions,
  checkShipCollision,
  setObstacles,
  setProjectiles,
  handleShipHit,
  increaseScore,
  increaseMeteorHits,
  increaseMultiplier,
  playSound
}: GameLoopProps) {
  
  // Main game update function
  const updateGame = useCallback(() => {
    if (gameOver) return;
    
    // Increment score on each frame
    increaseScore();
    
    // Create new obstacles at intervals
    const newObstacle = createObstacle();
    if (newObstacle) {
      console.log("Adding new obstacle to state:", newObstacle.id);
      setObstacles(prev => [...prev, newObstacle]);
    }
    
    // Update existing obstacles
    setObstacles(prev => {
      const updated = updateObstacles(prev);
      console.log("Updated obstacles count:", updated.length);
      return updated;
    });
    
    // Update projectile positions
    const updatedProjectiles = updateProjectiles(projectiles);
    setProjectiles(updatedProjectiles);
    
    // Check for projectile collisions with obstacles
    const { obstaclesHit, updatedObstacles: collidedObstacles, newProjectilesList } = 
      checkProjectileCollisions(obstacles, updatedProjectiles);
    
    // Handle obstacle destruction
    if (obstaclesHit) {
      console.log("Obstacle hit by projectile!");
      playSound('explosion');
      playSound('rumble');
      
      // Update game statistics
      increaseMeteorHits();
      increaseMultiplier();
      console.log("Score multiplier increased to:", scoreMultiplierRef.current * 1.2);
      console.log("Meteor hits:", parseInt(increaseMeteorHits.toString()) + 1);
      
      // Add bonus points
      increaseScore(50);
      
      // Update game objects
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }
    
    // Check for ship collisions with obstacles
    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOver);
    if (shipCollided && !isInvulnerable) {
      console.log("Ship collision detected!");
      handleShipHit();
    }
  }, [
    gameOver,
    createObstacle,
    updateObstacles,
    updateProjectiles,
    checkProjectileCollisions,
    checkShipCollision,
    obstacles,
    projectiles,
    shipPosition,
    playSound,
    isInvulnerable,
    handleShipHit,
    increaseScore,
    increaseMeteorHits,
    increaseMultiplier,
    setObstacles,
    setProjectiles,
    scoreMultiplierRef
  ]);

  return updateGame;
}
