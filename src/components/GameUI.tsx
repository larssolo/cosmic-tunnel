
import React, { useState, useEffect, useRef } from "react";
import { Zap, Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import { CountdownTimer } from "./CountdownTimer";

interface GameUIProps {
  score: number;
  gameOver: boolean;
  onRestart: () => void;
  onExit: () => void;
  onSubmitScore: (playerName: string) => Promise<void>;
  playerName: string;
  scoreMultiplier: number;
  meteorHits: number;
  lives: number;
  isInvulnerable: boolean;
  currentLevel?: number;
  tunnelMode?: boolean;
  countdownTime?: number;
  meteorStormWarning?: boolean;
  meteorStormActive?: boolean;
  bossDefeatedNotice?: boolean;
}

const GameUI: React.FC<GameUIProps> = ({
  score,
  gameOver,
  onRestart,
  onExit,
  onSubmitScore,
  playerName,
  scoreMultiplier,
  meteorHits,
  lives,
  isInvulnerable,
  currentLevel = 1,
  tunnelMode = false,
  countdownTime = 0,
  meteorStormWarning = false,
  meteorStormActive = false,
  bossDefeatedNotice = false,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [rankInfo, setRankInfo] = useState<{ rank: number; total: number } | null>(null);
  const [showHitFlash, setShowHitFlash] = useState(false);
  const submittedRef = useRef(false);
  const prevInvulnerableRef = useRef(false);
  const queryClient = useQueryClient();

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
    if (isInvulnerable && !prevInvulnerableRef.current && !gameOver) {
      setShowHitFlash(true);
      const t = setTimeout(() => setShowHitFlash(false), 700);
      prevInvulnerableRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isInvulnerable) prevInvulnerableRef.current = false;
  }, [isInvulnerable, gameOver]);

  useEffect(() => {
    if (gameOver) {
      setShowInstructions(true);
      setRankInfo(null);
      if (score > 0 && !submittedRef.current) {
        submittedRef.current = true;
        onSubmitScore(playerName)
          .then(() => CloudHighScoreService.getRankAndTotal(score))
          .then((info) => {
            setRankInfo(info);
            queryClient.invalidateQueries({ queryKey: ['highScores'] });
          });
      }
    } else {
      submittedRef.current = false;
      setRankInfo(null);
    }
  }, [gameOver, score, playerName, onSubmitScore, queryClient]);

  const hideInstructions = () => setShowInstructions(false);

  return (
    <div className="absolute inset-0 pointer-events-none font-robot9000">
      {tunnelMode && !gameOver && <CountdownTimer timeRemaining={countdownTime} />}

      {/* Boss Defeated Notice */}
      {bossDefeatedNotice && !gameOver && (
        <div
          className="absolute inset-x-0 top-1/3 flex items-center justify-center z-50 pointer-events-none"
        >
          <div style={{ fontFamily: "'Press Start 2P', monospace", textAlign: "center" }}>
            <p style={{ color: "#ffff00", fontSize: "clamp(16px, 3.5vw, 32px)", textShadow: "0 0 25px #ffff00, 0 0 50px #ff6600" }}>
              ★ BOSS DEFEATED ★
            </p>
            <p style={{ color: "#00ff00", fontSize: "clamp(10px, 1.6vw, 16px)", marginTop: "0.6rem", textShadow: "0 0 10px #00ff00" }}>
              +2000 BONUS
            </p>
          </div>
        </div>
      )}

      {/* Meteor Storm Warning */}
      {meteorStormWarning && !gameOver && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,0,0,0.25) 0%, transparent 70%)", animation: "stormPulse 0.5s ease-in-out infinite alternate" }}
        >
          <div style={{ fontFamily: "'Press Start 2P', monospace", textAlign: "center" }}>
            <p style={{ color: "#ff0000", fontSize: "clamp(14px, 3vw, 28px)", textShadow: "0 0 20px #ff0000, 0 0 40px #ff0000", animation: "stormPulse 0.4s ease-in-out infinite alternate" }}>
              ⚠ METEOR STORM ⚠
            </p>
            <p style={{ color: "#ff6600", fontSize: "clamp(8px, 1.5vw, 14px)", marginTop: "0.5rem", textShadow: "0 0 10px #ff6600" }}>
              INCOMING!
            </p>
          </div>
        </div>
      )}

      {/* Meteor Storm Active — red screen border pulse */}
      {meteorStormActive && !gameOver && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ boxShadow: "inset 0 0 60px rgba(255,0,0,0.4)", animation: "stormPulse 0.6s ease-in-out infinite alternate" }}
        />
      )}

      {/* Pilot + Level display */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 text-white">
        <p className="text-xs text-cyan-400">PILOT: {playerName}</p>
        <p className="text-lg font-bold text-purple-400">Level {currentLevel}</p>
        {tunnelMode && <p className="text-xs text-yellow-400 mt-1">Tunnel Mode</p>}
      </div>

      {/* Score */}
      <div className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
           style={{ boxShadow: "0 0 10px rgba(155, 135, 245, 0.3)", border: "1px solid rgba(155, 135, 245, 0.2)" }}>
        <p className="font-bold">Score: {score}</p>
        <p className="text-sm text-green-300 font-medium">Meteor Hit: {meteorHits}</p>
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
          className="absolute inset-0 flex items-center justify-center flex-col gap-4 pointer-events-auto"
          style={{ background: "rgba(0,0,0,0.96)" }}
          style={{ fontFamily: "'Press Start 2P', monospace", zIndex: 30 }}
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

          {/* Rank among all pilots */}
          {score > 0 && (
            <div className="mt-4 text-center">
              {rankInfo ? (
                <>
                  <p
                    className="text-[10px] md:text-sm"
                    style={{ color: "#ffaaff", textShadow: "0 0 8px #ff66ff" }}
                  >
                    PILOT {playerName} HOLDS RANK
                  </p>
                  <p
                    className="text-base md:text-2xl mt-1"
                    style={{ color: "#ffff00", textShadow: "0 0 12px #ffff00, 0 0 24px #ff8800" }}
                  >
                    #{rankInfo.rank} OF {rankInfo.total}
                  </p>
                  {rankInfo.rank === 1 && (
                    <p className="text-[10px] md:text-sm mt-1" style={{ color: "#00ff00", textShadow: "0 0 8px #00ff00" }}>
                      🏆 NEW WORLD RECORD! 🏆
                    </p>
                  )}
                  {rankInfo.rank > 1 && rankInfo.rank <= 10 && (
                    <p className="text-[10px] md:text-sm mt-1" style={{ color: "#00ff00", textShadow: "0 0 8px #00ff00" }}>
                      ★ TOP 10 PILOT ★
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[10px] md:text-sm" style={{ color: "#888" }}>
                  CALCULATING RANK...
                </p>
              )}
            </div>
          )}

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

          <button
            onClick={onExit}
            className="mt-3 px-6 py-3 text-[10px] md:text-xs transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              backgroundColor: "transparent",
              color: "#00ffff",
              border: "2px solid #00ffff",
              textShadow: "0 0 6px #00ffff",
              boxShadow: "0 0 10px #00ffff66",
            }}
          >
            ✦ EXIT SPACESHIP ✦
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
      {/* 8-bit hit flash */}
      {showHitFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 28, animation: "hitFlash 0.7s steps(1, end) forwards" }}
        />
      )}

      <style>{`
        @keyframes stormPulse {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
        @keyframes hitFlash {
          0%   { background: rgba(255,0,0,0.75); }
          14%  { background: rgba(255,255,255,0.6); }
          28%  { background: rgba(255,0,0,0.55); }
          42%  { background: rgba(255,255,255,0.35); }
          57%  { background: rgba(255,0,0,0.3); }
          71%  { background: rgba(255,255,255,0.1); }
          100% { background: rgba(255,0,0,0); }
        }
      `}</style>
    </div>
  );
};

export default GameUI;
