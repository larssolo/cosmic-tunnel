import React, { useEffect, useRef, useState } from "react";
import Tunnel from "./Tunnel";
import TunnelMode from "./TunnelMode";
import Obstacles from "./Obstacles";
import TunnelObstacles from "./TunnelObstacles";
import Spaceship from "./Spaceship";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import Boss from "./Boss";
import Ufos from "./Ufos";
import BonusStar from "./BonusStar";
import SpeedRing from "./SpeedRing";
import GravityWell from "./GravityWell";
import useGameState from "@/hooks/useGameState";
import ScorePopups from "./ScorePopups";
import { PowerUps } from "./PowerUps";
import { ActivePowerUpIndicators } from "./ActivePowerUpIndicators";
import { LevelUpNotification } from "./LevelUpNotification";
import { AchievementUnlockedNotification } from "./AchievementUnlockedNotification";
import { TunnelTransition } from "./TunnelTransition";
import { CyberOverlay } from "./CyberOverlay";
import VoidEntity from "./VoidEntity";
import VictoryScreen from "./VictoryScreen";
import ContinueScreen from "./ContinueScreen";
import { getLevelByScore } from "@/config/levels";
import { GameMode } from "@/types/gameModeTypes";
import { unlockAudio, soundManager } from "@/hooks/useSound";

interface GameProps {
  playerName: string;
  onExit: () => void;
}

const Game: React.FC<GameProps> = ({ playerName, onExit }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const updateGameRef = useRef<() => void>(() => {});
  const shipPositionRef = useRef<number>(50);
  const keysDownRef = useRef<Set<string>>(new Set());
  const kbPosRef = useRef<number>(50);
  const moveShipRef = useRef<(pos: number) => void>(() => {});
  const shootRef = useRef<() => void>(() => {});
  const lastHoldShotRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);
  const touchHeldRef = useRef<boolean>(false);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const lastTouchEndRef = useRef<number>(0);
  const kbVertRef = useRef<number>(82);
  const moveShipVertRef = useRef<(pos: number) => void>(() => {});
  const isTunnelModeRef = useRef<boolean>(false);

  const {
    score,
    gameOver,
    isVictory,
    shipPosition,
    shipVertical,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits,
    lives,
    isInvulnerable,
    hitFlash,
    currentLevel,
    levelUpNotification,
    powerUps,
    activePowerUps,
    achievementNotifications,
    tunnelActive,
    countdownTime,
    tunnelTransition,
    meteorStormWarning,
    meteorStormActive,
    boss,
    bossLasers,
    bossDefeatedNotice,
    lifeGainedNotice,
    ufos,
    ufoBullets,
    bonusStar,
    bonusRoundEndTime,
    speedRing,
    gravityWell,
    voidEntity,
    resetGame,
    moveShip,
    moveShipVertical,
    shootProjectile,
    updateGame,
    submitHighScore,
    comboCount,
    comboNotice,
    grazeNotice,
    scorePopups,
    showContinue,
    useContinue,
    declineContinue,
    isPersonalBest,
  } = useGameState();

  updateGameRef.current = updateGame;
  moveShipRef.current = moveShip;
  shootRef.current = shootProjectile;
  shipPositionRef.current = shipPosition;
  gameOverRef.current = gameOver;
  // Keep kbPos in sync when ship moves via mouse/touch so keyboard picks up from correct position
  kbPosRef.current = shipPosition;
  moveShipVertRef.current = moveShipVertical;
  kbVertRef.current = shipVertical;

  // Unlock audio context as soon as Game mounts (right after user clicked START)
  useEffect(() => { unlockAudio(); }, []);

  // iOS/Android block audio.play() outside a user gesture context.
  // Keep retrying resumeAtmosphere on every interaction until it's actually playing.
  useEffect(() => {
    const atmosphere = () => soundManager.resumeAtmosphere();
    window.addEventListener('pointerdown', atmosphere, { passive: true });
    window.addEventListener('touchstart', atmosphere, { passive: true });
    window.addEventListener('click', atmosphere);
    return () => {
      window.removeEventListener('pointerdown', atmosphere);
      window.removeEventListener('touchstart', atmosphere);
      window.removeEventListener('click', atmosphere);
    };
  }, []);

  const [shaking, setShaking] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  useEffect(() => {
    if (!hitFlash) return;
    setShaking(true);
    setFlashVisible(true);
    const t1 = setTimeout(() => setShaking(false), 450);
    const t2 = setTimeout(() => setFlashVisible(false), 250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [hitFlash]);

  const [shakingSm, setShakingSm] = useState(false);
  useEffect(() => {
    if (!bossDefeatedNotice) return;
    setShakingSm(true);
    const t = setTimeout(() => setShakingSm(false), 350);
    return () => clearTimeout(t);
  }, [bossDefeatedNotice]);

  // Mount-once movement handlers — use refs so they never go stale or re-subscribe
  useEffect(() => {
    // Desktop: ship follows the pointer position directly
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // touch uses drag control below
      if (gameOverRef.current || !gameContainerRef.current) return;
      const rect = gameContainerRef.current.getBoundingClientRect();
      if (rect.width === 0) return;
      moveShipRef.current(((e.clientX - rect.left) / rect.width) * 100);
      if (!isTunnelModeRef.current) {
        moveShipVertRef.current(((e.clientY - rect.top) / rect.height) * 100);
      }
    };

    // MOBILE: relative drag — the ship follows finger MOVEMENT, not finger position,
    // so your thumb never covers the ship. Holding the finger down auto-fires.
    const DRAG_SENSITIVITY = 1.3;
    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
      if (gameOverRef.current) return;
      touchHeldRef.current = true;
      // First shot fires instantly; the game loop keeps firing while held
      shootRef.current();
      lastHoldShotRef.current = Date.now();
    };
    const handleTouchMove = (e: TouchEvent) => {
      const last = lastTouchRef.current;
      if (!last || e.touches.length === 0 || !gameContainerRef.current) return;
      const rect = gameContainerRef.current.getBoundingClientRect();
      if (rect.width === 0 || gameOverRef.current) return;
      const t = e.touches[0];
      // Incremental deltas (not distance-from-start) so the ship never rubber-bands
      // after clamping at the edges
      const dx = ((t.clientX - last.x) / rect.width) * 100 * DRAG_SENSITIVITY;
      lastTouchRef.current = { x: t.clientX, y: t.clientY };
      kbPosRef.current = Math.max(10, Math.min(90, kbPosRef.current + dx));
      moveShipRef.current(kbPosRef.current);
      if (!isTunnelModeRef.current) {
        const dy = ((t.clientY - last.y) / rect.height) * 100 * DRAG_SENSITIVITY;
        kbVertRef.current = Math.max(35, Math.min(88, kbVertRef.current + dy));
        moveShipVertRef.current(kbVertRef.current);
      }
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        // Another finger is still down — hand the drag over to it
        lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return;
      }
      touchHeldRef.current = false;
      lastTouchRef.current = null;
      lastTouchEndRef.current = Date.now();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard listeners — purely track which keys are held; no separate rAF loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!e.repeat) {
          shootRef.current();
          lastHoldShotRef.current = Date.now();
        }
        keysDownRef.current.add("Space");
        return;
      }
      if (e.code === "ArrowLeft" || e.code === "ArrowRight" || e.code === "ArrowUp" || e.code === "ArrowDown") {
        e.preventDefault();
        keysDownRef.current.add(e.code);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysDownRef.current.delete(e.code); };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Single game loop — applies keyboard movement then runs game logic each frame
  useEffect(() => {
    const FPS = 60;
    const frameDelay = 1000 / FPS;
    const STEP = 1.8; // % per frame

    const gameLoop = (timestamp: number) => {
      if (timestamp - lastTimestampRef.current >= frameDelay) {
        // Apply keyboard movement first, synchronously, before game logic reads shipPosition
        const keys = keysDownRef.current;
        if (keys.has("ArrowLeft") || keys.has("ArrowRight")) {
          if (keys.has("ArrowLeft"))  kbPosRef.current = Math.max(10, kbPosRef.current - STEP);
          if (keys.has("ArrowRight")) kbPosRef.current = Math.min(90, kbPosRef.current + STEP);
          moveShipRef.current(kbPosRef.current);
        }
        if ((keys.has("ArrowUp") || keys.has("ArrowDown")) && !isTunnelModeRef.current) {
          if (keys.has("ArrowUp"))   kbVertRef.current = Math.max(35, kbVertRef.current - STEP);
          if (keys.has("ArrowDown")) kbVertRef.current = Math.min(88, kbVertRef.current + STEP);
          moveShipVertRef.current(kbVertRef.current);
        }
        updateGameRef.current();
        // Auto-fire while Space is held (desktop) or a finger is on the screen (mobile)
        if (keys.has("Space") || touchHeldRef.current) {
          const nowMs = Date.now();
          if (nowMs - lastHoldShotRef.current >= 220) {
            shootRef.current();
            lastHoldShotRef.current = nowMs;
          }
        }
        lastTimestampRef.current = timestamp;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current !== null) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle click to shoot (desktop). Touch auto-fires via the game loop, and the
  // synthetic click that follows touchend must not fire an extra shot.
  const handleShoot = () => {
    if (touchHeldRef.current || Date.now() - lastTouchEndRef.current < 500) return;
    if (!gameOver) {
      shootProjectile();
    }
  };

  // Determine current game mode
  const currentLevelData = getLevelByScore(score);
  const isTunnelMode = currentLevelData.gameMode === GameMode.TUNNEL && tunnelActive;
  isTunnelModeRef.current = isTunnelMode;

  // Vertical steering is a corridor no-go — lock the ship back to center while in tunnel mode
  useEffect(() => {
    if (isTunnelMode) moveShipVertical(82);
  }, [isTunnelMode, moveShipVertical]);

  return (
    <div
      ref={gameContainerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${shaking ? "game-shake" : shakingSm ? "game-shake-sm" : ""}`}
      style={{ touchAction: "none" }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        if (gameOverRef.current || !gameContainerRef.current) return;
        const rect = gameContainerRef.current.getBoundingClientRect();
        if (rect.width === 0) return;
        moveShipRef.current(((e.clientX - rect.left) / rect.width) * 100);
        if (!isTunnelModeRef.current) {
          moveShipVertRef.current(((e.clientY - rect.top) / rect.height) * 100);
        }
      }}
      onClick={handleShoot}
    >
      {/* Game world - conditional rendering based on mode */}
      {isTunnelMode ? (
        <>
          <TunnelMode />
          <TunnelObstacles obstacles={obstacles} />
        </>
      ) : (
        <>
          <Tunnel speedMultiplier={currentLevelData.speedMultiplier} />
          <Obstacles obstacles={obstacles} bonusRound={!!bonusRoundEndTime} />
        </>
      )}

      <VoidEntity voidEntity={voidEntity} />
      <SpeedRing ring={speedRing} />
      <GravityWell well={gravityWell} />
      <PowerUps powerUps={powerUps} />
      <Projectiles projectiles={projectiles} />
      <Boss boss={boss} lasers={bossLasers} />
      <Ufos ufos={ufos} bullets={ufoBullets} />
      <BonusStar star={bonusStar} />
      {bonusRoundEndTime && (
        <div
          className="absolute top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          style={{ fontFamily: "'Press Start 2P', monospace", textAlign: "center" }}
        >
          <p
            style={{
              color: "#ffff00",
              fontSize: "clamp(14px, 2.5vw, 24px)",
              textShadow: "0 0 16px #ffff00, 0 0 32px #ffaa00, 3px 3px 0 #000",
              animation: "bonusRoundPulse 0.5s ease-in-out infinite alternate",
            }}
          >
            ★ BONUS ROUND ★
          </p>
          <p style={{ color: "#ffaa00", fontSize: "clamp(8px, 1.4vw, 12px)", marginTop: "0.4rem", textShadow: "0 0 8px #ffaa00" }}>
            COLLECT THE COINS!
          </p>
          <style>{`@keyframes bonusRoundPulse { from { transform: scale(0.95); } to { transform: scale(1.08); } }`}</style>
        </div>
      )}
      <Spaceship position={shipPosition} vertical={shipVertical} isInvulnerable={isInvulnerable} isExploding={gameOver} />

      {grazeNotice && (
        <div
          className="absolute pointer-events-none z-[65]"
          style={{
            left: `${shipPosition}%`, top: `${shipVertical - 9}%`,
            transform: "translateX(-50%)",
            fontFamily: "'Press Start 2P', monospace", fontSize: "10px",
            color: "#7df4ff", textShadow: "0 0 8px #00e5ff, 2px 2px 0 #000",
            animation: "comboPop 0.6s ease-out forwards",
          }}
        >
          GRAZE! +25
        </div>
      )}

      {/* Kill-streak announcer */}
      {comboNotice && (
        <div className="absolute inset-x-0 flex justify-center pointer-events-none" style={{ top: "28%", zIndex: 55 }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: comboCount >= 8 ? "clamp(18px, 4vw, 36px)" : "clamp(14px, 3vw, 28px)",
            color: comboCount >= 16 ? "#ffffff" : comboCount >= 12 ? "#ff2200" : comboCount >= 8 ? "#ff00ff" : comboCount >= 5 ? "#ff8800" : "#ffff00",
            textShadow: comboCount >= 16
              ? "0 0 24px #ff2200, 0 0 48px #ff2200, 3px 3px 0 #000"
              : "0 0 20px currentColor, 3px 3px 0 #000",
            animation: "announcerSlam 1.2s cubic-bezier(0.16, 1.6, 0.4, 1) forwards",
            textAlign: "center",
          }}>
            {comboCount >= 16 ? "☠ GODLIKE ☠"
              : comboCount >= 12 ? "★ UNSTOPPABLE ★"
              : comboCount >= 8 ? "★ RAMPAGE ★"
              : comboCount >= 5 ? "MULTI KILL!"
              : "TRIPLE KILL!"}
            <div style={{ fontSize: "0.5em", marginTop: "0.5em", color: "#ffff88", textShadow: "0 0 10px #ffff00, 2px 2px 0 #000" }}>
              x{comboCount} STREAK
            </div>
          </div>
        </div>
      )}

      {/* Floating score popups at kill sites */}
      <ScorePopups popups={scorePopups} />

      {flashVisible && (
        <div
          className="absolute inset-0 pointer-events-none z-[70]"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,0,0,0.28) 0%, rgba(255,0,0,0.55) 100%)", animation: "hitFlashFade 0.25s ease-out forwards" }}
        />
      )}

      {/* Game UI */}
      <GameUI
        score={score}
        gameOver={gameOver}
        onRestart={resetGame}
        onExit={onExit}
        onSubmitScore={submitHighScore}
        playerName={playerName}
        scoreMultiplier={scoreMultiplier}
        meteorHits={meteorHits}
        lives={lives}
        isInvulnerable={isInvulnerable}
        currentLevel={currentLevel}
        tunnelMode={isTunnelMode}
        countdownTime={countdownTime}
        meteorStormWarning={meteorStormWarning}
        meteorStormActive={meteorStormActive}
        bossDefeatedNotice={bossDefeatedNotice}
        lifeGainedNotice={lifeGainedNotice}
        isPersonalBest={isPersonalBest}
      />

      {/* Active power-ups indicator */}
      <ActivePowerUpIndicators activePowerUps={activePowerUps} />

      {/* Level up notification */}
      {levelUpNotification && (
        <LevelUpNotification 
          level={levelUpNotification.level} 
          name={levelUpNotification.name} 
        />
      )}

      {/* Achievement notifications */}
      {achievementNotifications.map((achievement, index) => (
        <div key={achievement.id} style={{ top: `${1 + index * 7.5}rem` }} className="absolute right-0 z-50">
          <AchievementUnlockedNotification
            achievement={achievement}
            onDismiss={() => {}}
          />
        </div>
      ))}

      {/* Cyber overlay for tunnel mode */}
      <CyberOverlay isActive={isTunnelMode} />

      {/* Tunnel transition overlay */}
      <TunnelTransition isActive={tunnelTransition} />

      {/* Continue screen */}
      {showContinue && (
        <ContinueScreen onContinue={useContinue} onGameOver={declineContinue} />
      )}

      {/* Victory screen */}
      {isVictory && (
        <VictoryScreen
          score={score}
          playerName={playerName}
          meteorHits={meteorHits}
          onRestart={resetGame}
          onExit={onExit}
        />
      )}
    </div>
  );
};

export default Game;
