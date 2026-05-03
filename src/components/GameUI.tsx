
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Heart, Trophy } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import { CountdownTimer } from "./CountdownTimer";
import PlayerNameDialog from "./PlayerNameDialog";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  onSubmitScore: (playerName: string) => Promise<void>;
  scoreMultiplier: number;
  meteorHits: number;
  lives: number;
  isInvulnerable: boolean;
  currentLevel?: number;
  tunnelMode?: boolean;
  countdownTime?: number;
}

const GameUI: React.FC<GameUIProps> = ({
  score,
  gameOver,
  onRestart,
  onSubmitScore,
  scoreMultiplier,
  meteorHits,
  lives,
  isInvulnerable,
  currentLevel = 1,
  tunnelMode = false,
  countdownTime = 0
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const { data: highScores = [] } = useQuery({
    queryKey: ['highScores'],
    queryFn: () => CloudHighScoreService.getHighScores(10),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (showInstructions) {
      const handleInteraction = () => hideInstructions();
      window.addEventListener('pointerdown', handleInteraction, { once: true });
      window.addEventListener('pointermove', handleInteraction, { once: true });
      return () => {
        window.removeEventListener('pointerdown', handleInteraction);
        window.removeEventListener('pointermove', handleInteraction);
      };
    }
  }, [showInstructions]);

  useEffect(() => {
    if (gameOver) {
      setShowInstructions(true);
      setScoreSubmitted(false);
      if (score > 0) {
        setShowNameDialog(true);
      }
    }
  }, [gameOver]);

  const hideInstructions = () => setShowInstructions(false);

  const handleNameSubmit = async (name: string) => {
    setShowNameDialog(false);
    setScoreSubmitted(true);
    await onSubmitScore(name);
    queryClient.invalidateQueries({ queryKey: ['highScores'] });
  };

  return (
    <div className="absolute inset-0 pointer-events-none font-robot9000">
      {tunnelMode && !gameOver && <CountdownTimer timeRemaining={countdownTime} />}

      {/* Level display */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 text-white">
        <p className="text-lg font-bold text-purple-400">Level {currentLevel}</p>
        {tunnelMode && <p className="text-xs text-yellow-400 mt-1">Tunnel Mode</p>}
      </div>

      {/* Score + leaderboard */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
           style={{ boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)", border: "1px solid rgba(155, 135, 245, 0.2)" }}>
        <p className="font-bold">Score: {score}</p>
        <p className="text-sm text-green-300 font-medium">Meteor Hit: {meteorHits}</p>
        <div className="mt-2 pt-2 border-t border-purple-500/20">
          <p className="text-xs flex items-center gap-1 mb-1 text-yellow-400">
            <Trophy size={12} />
            <span>Best Pilots</span>
          </p>
          {highScores.length > 0 ? (
            <ul className="text-xs space-y-1">
              {highScores.map((entry, idx) => (
                <li key={idx} className="flex justify-between gap-3">
                  <span className={idx === 0 ? "text-yellow-400" : idx === 1 ? "text-gray-300" : idx === 2 ? "text-amber-600" : ""}>
                    {entry.player_name}
                  </span>
                  <span>{entry.score}</span>
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
           style={{ boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)", border: "1px solid rgba(155, 135, 245, 0.2)" }}>
        {Array.from({ length: lives }).map((_, index) => (
          <Heart key={index} size={18} className={`fill-red-500 text-red-500 ${isInvulnerable ? 'animate-pulse' : ''}`} />
        ))}
      </div>

      {/* Player name dialog */}
      <div className="pointer-events-auto">
        <PlayerNameDialog
          open={showNameDialog}
          onSubmit={handleNameSubmit}
          onClose={() => setShowNameDialog(false)}
        />
      </div>

      {/* Game over screen */}
      {gameOver && !showNameDialog && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-4 pointer-events-auto backdrop-blur-sm">
          <h2 className="text-6xl font-bold text-white"
              style={{ textShadow: "0 0 10px rgba(155, 135, 245, 0.8)" }}>Game Over</h2>
          <p className="text-2xl text-white">Final Score: {score}</p>
          <p className="text-lg text-green-300">Meteor Hit: {meteorHits}</p>
          <Button onClick={onRestart} className="mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            Play Again
          </Button>
        </div>
      )}

      {/* Instructions */}
      {showInstructions && !gameOver && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black/50 py-2 backdrop-blur-sm"
             style={{ boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)", border: "1px solid rgba(155, 135, 245, 0.2)" }}>
          {tunnelMode ? (
            <>
              <p className="text-yellow-400 font-bold mb-1">🚀 TUNNEL MODE ACTIVATED!</p>
              <p className="md:block hidden">Fly through the meteor tunnel! Small rocks = HIGH POINTS!</p>
              <p className="md:hidden">Tilt to dodge! Small rocks = HIGH POINTS!</p>
            </>
          ) : (
            <>
              <p className="md:block hidden">Move mouse left/right to control the spaceship</p>
              <p className="md:hidden">Tilt your phone left/right to control the spaceship</p>
            </>
          )}
          <p className="flex items-center justify-center gap-1 mt-1">
            <span>Click/tap to shoot</span>
            <Zap size={16} className="text-yellow-300" />
          </p>
        </div>
      )}
    </div>
  );
};

export default GameUI;
