
import React, { useState, useEffect, useRef } from "react";
import { Zap } from "lucide-react";
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
  lifeGainedNotice?: boolean;
  isPersonalBest?: boolean;
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
  lifeGainedNotice = false,
  isPersonalBest = false,
}) => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [rankInfo, setRankInfo] = useState<{ rank: number; total: number } | null>(null);
  const [showHitFlash, setShowHitFlash] = useState(false);
  const submittedRef = useRef(false);
  const queryClient = useQueryClient();

  // Cinematic game over: let the explosion play out before the overlay slams in
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!gameOver) { setOverlayVisible(false); setDisplayScore(0); return; }
    const t = setTimeout(() => setOverlayVisible(true), 1400);
    return () => clearTimeout(t);
  }, [gameOver]);

  // Score counts up arcade-style once the overlay is visible
  useEffect(() => {
    if (!overlayVisible) return;
    const start = performance.now();
    const duration = 1100;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(score * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [overlayVisible, score]);

  // Session-best score for the classic HI readout
  const [hiScore, setHiScore] = useState(0);
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(`pb_${playerName}`) ?? "0", 10);
    setHiScore(Number.isNaN(stored) ? 0 : stored);
  }, [playerName, gameOver]);

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
    if (isInvulnerable && !gameOver) {
      setShowHitFlash(true);
      const t = setTimeout(() => setShowHitFlash(false), 600);
      return () => clearTimeout(t);
    }
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

      {/* Life Gained Notice */}
      {lifeGainedNotice && !gameOver && (
        <div className="absolute inset-x-0 top-1/2 flex items-center justify-center z-50 pointer-events-none">
          <div style={{ fontFamily: "'Press Start 2P', monospace", textAlign: "center", animation: "lifeGainPop 1.5s ease-out forwards" }}>
            <p style={{ color: "#ff3366", fontSize: "clamp(18px, 4vw, 36px)", textShadow: "0 0 25px #ff3366, 0 0 50px #ff0044" }}>
              ♥ +1 LIFE ♥
            </p>
          </div>
          <style>{`@keyframes lifeGainPop { 0% { transform: scale(0.5); opacity: 0; } 25% { transform: scale(1.3); opacity: 1; } 75% { transform: scale(1); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }`}</style>
        </div>
      )}

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
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ boxShadow: "inset 0 0 110px rgba(255,0,0,0.55)", animation: "stormPulse 0.6s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.07]"
            style={{
              background: "repeating-linear-gradient(115deg, transparent 0px, transparent 18px, #ff2200 19px, transparent 20px)",
              animation: "stormStreak 0.4s linear infinite",
            }}
          />
          <style>{`@keyframes stormStreak { from { background-position: 0 0; } to { background-position: -40px 20px; } }`}</style>
        </>
      )}

      {/* ARCADE HUD — left column: 1UP / score / HI / lives */}
      <div className="absolute top-3 left-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <p style={{ color: "#ff5555", fontSize: "clamp(7px, 1vw, 9px)", textShadow: "1px 1px 0 #000", letterSpacing: "0.1em" }}>
          1UP · {playerName}
        </p>
        <p style={{ color: "#ffff00", fontSize: "clamp(15px, 2.4vw, 24px)", textShadow: "0 0 10px #ffff00, 2px 2px 0 #000", marginTop: "3px" }}>
          {String(score).padStart(6, "0")}
        </p>
        <p style={{ color: "#ffffff", fontSize: "clamp(7px, 0.9vw, 9px)", textShadow: "1px 1px 0 #000", marginTop: "3px", opacity: 0.8 }}>
          HI {String(Math.max(hiScore, score)).padStart(6, "0")}
        </p>
        <div className="flex items-center gap-1.5" style={{ marginTop: "6px" }}>
          {Array.from({ length: lives }).map((_, index) => (
            <span
              key={index}
              className={isInvulnerable ? "animate-pulse" : ""}
              style={{
                color: "#00ffff",
                fontSize: "clamp(10px, 1.4vw, 14px)",
                textShadow: "0 0 6px #00ffff, 1px 1px 0 #000",
              }}
            >
              ▲
            </span>
          ))}
          {lives === 1 && (
            <span style={{ color: "#ff2200", fontSize: "clamp(6px, 0.9vw, 8px)", textShadow: "0 0 6px #ff2200", marginLeft: "4px", animation: "dangerBlink 0.5s step-end infinite" }}>
              ⚠ LAST SHIP
            </span>
          )}
        </div>
      </div>

      {/* ARCADE HUD — right column: level / multiplier heat / meteors */}
      <div className="absolute top-3 right-4 text-right" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        <p style={{ color: "#ff00ff", fontSize: "clamp(8px, 1.2vw, 11px)", textShadow: "0 0 8px #ff00ff, 1px 1px 0 #000" }}>
          LEVEL {currentLevel}
        </p>
        {tunnelMode && (
          <p style={{ color: "#00ffff", fontSize: "clamp(6px, 0.9vw, 8px)", textShadow: "0 0 6px #00ffff", marginTop: "3px" }}>
            ▓ TUNNEL MODE ▓
          </p>
        )}
        <p
          key={Math.round(scoreMultiplier * 10)}
          style={{
            color: scoreMultiplier >= 6 ? "#ff2200" : scoreMultiplier >= 4 ? "#ff8800" : scoreMultiplier >= 2 ? "#ffff00" : "#ffffff",
            fontSize: "clamp(13px, 2vw, 20px)",
            textShadow: scoreMultiplier >= 4 ? "0 0 14px currentColor, 2px 2px 0 #000" : "0 0 8px currentColor, 2px 2px 0 #000",
            marginTop: "5px",
            animation: "hudPulse 0.35s ease-out",
          }}
        >
          ×{scoreMultiplier.toFixed(1)}
        </p>
        <p style={{ color: "#00ff88", fontSize: "clamp(6px, 0.9vw, 8px)", textShadow: "1px 1px 0 #000", marginTop: "4px", opacity: 0.8 }}>
          METEORS {meteorHits}
        </p>
      </div>

      {/* LAST SHIP danger vignette */}
      {lives === 1 && !gameOver && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ boxShadow: "inset 0 0 90px rgba(255,20,20,0.45)", animation: "dangerVignette 1.1s ease-in-out infinite alternate" }}
        />
      )}

      {/* Game over screen — waits for the explosion, then slams in */}
      {gameOver && overlayVisible && (
        <div
          className="absolute inset-0 flex items-center justify-center flex-col gap-4 pointer-events-auto"
          style={{
            background: "rgba(0,0,0,0.96)",
            fontFamily: "'Press Start 2P', monospace",
            zIndex: 30,
            animation: "overlayFadeIn 0.35s ease-out",
          }}
        >
          <h2
            className="text-3xl md:text-5xl"
            style={{
              color: "#ff00ff",
              textShadow: "3px 3px 0 #00ffff, 6px 6px 0 #000",
              letterSpacing: "0.05em",
              animation: "gameOverSlam 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) both",
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
            SCORE: {String(displayScore).padStart(6, "0")}
          </p>
          {isPersonalBest && (
            <p
              className="text-[10px] md:text-sm mt-1"
              style={{ color: "#00ff88", textShadow: "0 0 12px #00ff88, 0 0 24px #00ff44", animation: "pbFlash 0.6s ease-in-out infinite alternate" }}
            >
              ★ NEW PERSONAL BEST ★
            </p>
          )}
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
              <p className="md:block hidden">Move the mouse to steer — near-misses give GRAZE bonus!</p>
              <p className="md:hidden">Tilt your phone to steer — near-misses give GRAZE bonus!</p>
            </>
          )}
          <p className="flex items-center justify-center gap-1 mt-1">
            <span>Click/tap to shoot — chain kills for streaks</span>
            <Zap size={16} className="text-yellow-300" />
          </p>
        </div>
      )}
      {/* 8-bit hit flash */}
      {showHitFlash && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 28, animation: "hitFlash 0.6s linear forwards" }}
        />
      )}

      <style>{`
        @keyframes stormPulse {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
        @keyframes pbFlash {
          from { opacity: 0.6; transform: scale(0.97); }
          to   { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes hitFlash {
          0%   { background: rgba(255, 30, 30, 0.88); }
          20%  { background: rgba(255, 255, 255, 0.72); }
          45%  { background: rgba(255, 30, 30, 0.52); }
          70%  { background: rgba(255, 255, 255, 0.22); }
          100% { background: transparent; }
        }
        @keyframes dangerBlink { 50% { opacity: 0; } }
        @keyframes dangerVignette {
          from { opacity: 0.35; }
          to   { opacity: 1; }
        }
        @keyframes hudPulse {
          0%   { transform: scale(1.45); }
          100% { transform: scale(1); }
        }
        @keyframes overlayFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gameOverSlam {
          0%   { transform: scale(3.2); opacity: 0; }
          60%  { transform: scale(0.92); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GameUI;
