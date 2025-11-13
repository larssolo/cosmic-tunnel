
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Heart, User, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  scoreMultiplier: number;
  meteorHits: number;
  lives: number;
  isInvulnerable: boolean;
  currentLevel?: number;
}

const GameUI: React.FC<GameUIProps> = ({ 
  score, 
  gameOver, 
  onRestart, 
  scoreMultiplier, 
  meteorHits, 
  lives,
  isInvulnerable,
  currentLevel = 1
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Fetch high scores using react-query
  const { data: highScores = [] } = useQuery({
    queryKey: ['highScores'],
    queryFn: () => CloudHighScoreService.getHighScores(10),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Hide instructions on game interaction
  const hideInstructions = () => {
    setShowInstructions(false);
  };
  
  // Add event listeners to hide instructions on first interaction
  useEffect(() => {
    if (showInstructions) {
      // Hide on any pointer move or tap
      const handleInteraction = () => {
        hideInstructions();
      };
      
      window.addEventListener('pointerdown', handleInteraction, { once: true });
      window.addEventListener('pointermove', handleInteraction, { once: true });
      
      return () => {
        window.removeEventListener('pointerdown', handleInteraction);
        window.removeEventListener('pointermove', handleInteraction);
      };
    }
  }, [showInstructions]);
  
  // Show instructions again when game restarts
  useEffect(() => {
    if (gameOver) {
      setShowInstructions(true);
    }
  }, [gameOver]);
  
  return (
    <div className="absolute inset-0 pointer-events-none font-robot9000">
      {/* Level display */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 text-white">
        <p className="text-lg font-bold text-purple-400">Level {currentLevel}</p>
      </div>
      
      {/* Score display with meteor hits and high scores */}
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
        
        {/* Top 10 High Scores - Compact Display */}
        <div className="mt-2 pt-2 border-t border-purple-500/20">
          <p className="text-xs flex items-center gap-1 mb-1 text-yellow-400">
            <Trophy size={12} />
            <span>Best Pilots</span>
          </p>
          {highScores.length > 0 ? (
            <ul className="text-xs space-y-1">
              {highScores.map((score, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className={idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : ""}>
                    {score.player_name}
                  </span>
                  <span>{score.score}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No scores yet</p>
          )}
        </div>
      </div>

      {/* Lives display */}
      <div className="absolute top-20 left-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2"
           style={{
             boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)",
             border: "1px solid rgba(155, 135, 245, 0.2)"
           }}>
        {Array.from({ length: lives }).map((_, index) => (
          <Heart 
            key={index} 
            size={18} 
            className={`fill-red-500 text-red-500 ${isInvulnerable ? 'animate-pulse' : ''}`} 
          />
        ))}
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
