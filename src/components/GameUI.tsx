
import React from "react";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  scoreMultiplier: number; // Add the scoreMultiplier prop
}

const GameUI: React.FC<GameUIProps> = ({ score, gameOver, onRestart, scoreMultiplier }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score display with multiplier */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
           style={{
             boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)",
             border: "1px solid rgba(155, 135, 245, 0.2)"
           }}>
        <p className="font-bold">Score: {score}</p>
        {/* Only show multiplier when it's greater than 1 */}
        {scoreMultiplier > 1 && (
          <p className="text-sm text-yellow-300 font-medium">
            Multiplier: {scoreMultiplier.toFixed(1)}x
          </p>
        )}
      </div>

      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-4 pointer-events-auto backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white" 
              style={{textShadow: "0 0 10px rgba(155, 135, 245, 0.8)"}}>Game Over</h2>
          <p className="text-2xl text-white">Final Score: {score}</p>
          {scoreMultiplier > 1 && (
            <p className="text-lg text-yellow-300">Final Multiplier: {scoreMultiplier.toFixed(1)}x</p>
          )}
          <Button onClick={onRestart} className="mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            Play Again
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2 backdrop-blur-sm"
           style={{
             boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)",
             border: "1px solid rgba(155, 135, 245, 0.2)"
           }}>
        <p>Bevæg til venstre/højre for at styre rumskibet</p>
        <p className="flex items-center justify-center gap-1 mt-1">
          <span>Klik på rumskibet for at skyde</span> 
          <Zap size={16} className="text-yellow-300" />
        </p>
      </div>
    </div>
  );
};

export default GameUI;
