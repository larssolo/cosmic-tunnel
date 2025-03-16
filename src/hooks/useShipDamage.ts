
import { useState, useCallback, useEffect } from "react";

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble' | 'crash' | 'atmosphere';

export function useShipDamage(
  maxLives: number,
  isInvulnerable: boolean,
  setIsInvulnerable: (value: boolean) => void,
  setGameOver: (value: boolean) => void,
  playSound: (type: SoundType) => void
) {
  const [lives, setLives] = useState(maxLives);

  // Handle ship being hit
  const handleShipHit = useCallback(() => {
    if (isInvulnerable) return;
    
    setLives(prev => prev - 1);
    
    if (lives - 1 <= 0) {
      // Game over when no lives left
      setGameOver(true);
      playSound('crash');
    } else {
      // Set temporary invulnerability
      setIsInvulnerable(true);
      playSound('crash');
      
      // Reset invulnerability after 2 seconds
      setTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);
    }
  }, [isInvulnerable, lives, playSound, setGameOver, setIsInvulnerable]);

  // Reset lives to max
  const resetLives = useCallback(() => {
    setLives(maxLives);
  }, [maxLives]);

  return {
    lives,
    handleShipHit,
    resetLives
  };
}
