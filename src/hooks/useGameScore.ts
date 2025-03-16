import { useState, useCallback, useRef, useEffect } from "react";

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble' | 'crash' | 'atmosphere';

export function useGameScore(playSound: (type: SoundType) => void) {
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0.5);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [meteorHits, setMeteorHits] = useState(0);
  
  // Use ref to track current speed value for sound effects
  const currentSpeed = useRef(speed);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentSpeed.current = speed;
  }, [speed]);
  
  // Basic score increment
  const increaseScore = useCallback((amount: number = 1) => {
    setScore(prev => {
      const newScore = prev + Math.round(amount * scoreMultiplier);
      
      // Increase speed at score milestones
      if (newScore > 0 && newScore % 500 === 0) {
        setSpeed(prev => {
          const newSpeed = Math.min(prev + 0.1, 3.0);
          console.log("Speed increased to:", newSpeed);
          return newSpeed;
        });
        playSound('speedUp');
      }
      
      return newScore;
    });
  }, [scoreMultiplier, playSound]);
  
  // Increase meteor hits counter
  const increaseMeteorHits = useCallback(() => {
    setMeteorHits(prev => prev + 1);
  }, []);
  
  // Increase score multiplier
  const increaseMultiplier = useCallback(() => {
    setScoreMultiplier(prev => prev * 1.2);
  }, []);
  
  // Reset scoring system
  const resetScoreSystem = useCallback(() => {
    setScore(0);
    setSpeed(0.5);
    setScoreMultiplier(1);
    setMeteorHits(0);
  }, []);
  
  return {
    score,
    speed,
    scoreMultiplier,
    meteorHits,
    increaseScore,
    increaseMeteorHits,
    increaseMultiplier,
    resetScoreSystem
  };
}
