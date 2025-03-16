
import React, { useEffect, useRef } from "react";

interface ExplosionHandlerProps {
  gameOver: boolean;
  explosionComplete: boolean;
  onExplosionComplete: () => void;
}

const ExplosionHandler: React.FC<ExplosionHandlerProps> = ({
  gameOver,
  explosionComplete,
  onExplosionComplete,
}) => {
  const explosionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up explosion timer when game over occurs
  useEffect(() => {
    if (gameOver && !explosionComplete) {
      // Clear any existing timer
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
      
      // Set a new timer to mark explosion as complete after animation
      explosionTimerRef.current = setTimeout(() => {
        onExplosionComplete();
      }, 3500);
    }
    
    // Clean up timer on unmount
    return () => {
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
    };
  }, [gameOver, explosionComplete, onExplosionComplete]);

  // This component doesn't render anything visible
  return null;
};

export default ExplosionHandler;
