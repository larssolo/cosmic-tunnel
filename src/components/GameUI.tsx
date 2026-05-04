
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Heart, Trophy } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import { CountdownTimer } from "./CountdownTimer";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  onSubmitScore: (playerName: string) => Promise<void>;
  playerName: string;
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
  playerName,
  scoreMultiplier,
  meteorHits,
  lives,
  isInvulnerable,
  currentLevel = 1,
  tunnelMode = false,
  countdownTime = 0
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const submittedRef = useRef(false);
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
      if (score > 0 && !submittedRef.current) {
        submittedRef.current = true;
        onSubmitScore(playerName).then(() => {
          queryClient.invalidateQueries({ queryKey: ['highScores'] });
        });
      }
    } else {
      submittedRef.current = false;
    }
  }, [gameOver, score, playerName, onSubmitScore, queryClient]);

  const hideInstructions = () => setShowInstructions(false);

  return (
    <div className="absolute inset-0 pointer-events-none font-robot9000">
      {tunnelMode && !gameOver && <CountdownTimer timeRemaining={countdownTime} />}

      {/* Pilot + Level display */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 text-white">
        <p className="text-xs text-cyan-400">PILOT: {playerName}</p>
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
                <li key={entry.id} className="flex justify-between gap-3">
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

      {/* Game over screen */}
      {gameOver && (
        <div
          className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col gap-4 pointer-events-auto backdrop-blur-sm"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <h2
            className="text-3xl md:text-5xl"
            style={{
              color: "#ff00ff",
              textShadow: "3px 3px 0 #00ffff, 6px 6px 0 #000",
              letterSpacing: "0.05em",
            }}
          >
            GAME OVER
          </h2>
          <p
            className="text-sm md:text-lg mt-4"
            style={{ color: "#ffff00", textShadow: "0 0 8px #ffff00" }}
          >
            PILOT: {playerName}
          </p>
          <p
            className="text-base md:text-2xl"
            style={{ color: "#00ffff", textShadow: "0 0 10px #00ffff" }}
          >
            SCORE: {String(score).padStart(6, "0")}
          </p>
          <p
            className="text-xs md:text-sm"
            style={{ color: "#00ff00", textShadow: "0 0 6px #00ff00" }}
          >
            METEORS: {meteorHits}
          </p>
          <button
            onClick={onRestart}
            className="mt-6 px-6 py-4 text-xs md:text-sm transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              backgroundColor: "#ff00ff",
              color: "#fff",
              border: "4px solid #ffff00",
              textShadow: "2px 2px 0 #000",
              boxShadow: "0 0 25px #ff00ff, 4px 4px 0 #000",
            }}
          >
            ▶ PLAY AGAIN ◀
          </button>
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
