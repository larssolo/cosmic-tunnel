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
    
    // Update projectile positions - Use functional update to avoid stale state
    setProjectiles(prev => {
      const updatedProjectiles = updateProjectiles(prev);
      return updatedProjectiles;
    });
    
    // Use latest state for collision detection - capture current values for consistent check
    setProjectiles(currentProjectiles => {
      setObstacles(currentObstacles => {
        // Check for projectile collisions with obstacles using latest state
        const { obstaclesHit, updatedObstacles: collidedObstacles, newProjectilesList } = 
          checkProjectileCollisions(currentObstacles, currentProjectiles);
        
        // Handle obstacle destruction
        if (obstaclesHit) {
          console.log("Obstacle hit by projectile!");
          playSound('explosion');
          playSound('rumble');
          
          // Update game statistics
          increaseMeteorHits();
          increaseMultiplier();
          
          // Log with correct multiplier value from ref
          console.log("Score multiplier increased to:", scoreMultiplierRef.current * 1.2);
          console.log("Meteor hit registered");
          
          // Add bonus points
          increaseScore(50);
          
          // Return updated obstacles after collision
          return collidedObstacles;
        }
        
        // No hits, return original obstacles
        return currentObstacles;
      });
      
      // Check for projectile collisions again to get updated projectiles list
      const { obstaclesHit, newProjectilesList } = 
        checkProjectileCollisions(obstacles, currentProjectiles);
      
      // Return updated projectiles if there were hits, otherwise keep current
      return obstaclesHit ? newProjectilesList : currentProjectiles;
    });
    
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
