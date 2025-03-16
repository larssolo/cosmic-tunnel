
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
    
    // Update lives immediately for correct decision making
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      // Game over when no lives left
      setGameOver(true);
      playSound('gameOver');
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
