
import React from "react";
import { Button } from "@/components/ui/button";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ score, gameOver, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score display */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="font-bold">Score: {score}</p>
      </div>

      {/* Game over screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-4 pointer-events-auto">
          <h2 className="text-4xl font-bold text-white">Game Over</h2>
          <p className="text-2xl text-white">Final Score: {score}</p>
          <Button onClick={onRestart} className="mt-4">
            Play Again
          </Button>
        </div>
      )}

      {/* Instructions for mobile */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2 hidden md:block">
        <p>Touch and drag left/right to move spaceship</p>
      </div>
    </div>
  );
};

export default GameUI;
