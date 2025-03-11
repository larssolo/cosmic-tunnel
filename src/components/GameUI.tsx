
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  scoreMultiplier: number;
  meteorHits: number;
}

const GameUI: React.FC<GameUIProps> = ({ score, gameOver, onRestart, scoreMultiplier, meteorHits }) => {
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show instructions again when game restarts
  useEffect(() => {
    if (gameOver) {
      setShowInstructions(true);
    }
  }, [gameOver]);
  
  return (
    <div className="absolute inset-0 pointer-events-none font-robot9000">
      {/* Score display with meteor hits */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
           style={{
             boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)",
             border: "1px solid rgba(155, 135, 245, 0.2)"
           }}>
        <p className="font-bold">Score: {score}</p>
        
        {/* Display meteor hits counter */}
        <p className="text-sm text-green-300 font-medium">
          Meteor Hit: {meteorHits}
        </p>
      </div>

      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-4 pointer-events-auto backdrop-blur-sm">
          <h2 className="text-6xl font-bold text-white" 
              style={{textShadow: "0 0 10px rgba(155, 135, 245, 0.8)"}}>Game Over</h2>
          <p className="text-2xl text-white">Final Score: {score}</p>
          <p className="text-lg text-green-300">Meteor Hit: {meteorHits}</p>
          <Button onClick={onRestart} className="mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            Play Again
          </Button>
        </div>
      )}

      {/* Instructions - only show at the beginning */}
      {showInstructions && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2 backdrop-blur-sm"
             style={{
               boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)",
               border: "1px solid rgba(155, 135, 245, 0.2)"
             }}>
          <p className="md:block hidden">Bevæg til venstre/højre for at styre rumskibet</p>
          <p className="md:hidden">Vip telefonen til venstre/højre for at styre rumskibet</p>
          <p className="flex items-center justify-center gap-1 mt-1">
            <span>Klik på rumskibet for at skyde</span> 
            <Zap size={16} className="text-yellow-300" />
          </p>
        </div>
      )}
    </div>
  );
};

export default GameUI;
