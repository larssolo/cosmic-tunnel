import React, { useEffect, useRef } from "react";
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
import useGameState from "@/hooks/useGameState";
import { useIsMobile } from "@/hooks/use-mobile";
import { PowerUps } from "./PowerUps";
import { ActivePowerUpIndicators } from "./ActivePowerUpIndicators";
import { LevelUpNotification } from "./LevelUpNotification";
import { AchievementUnlockedNotification } from "./AchievementUnlockedNotification";
import { TunnelTransition } from "./TunnelTransition";
import { CyberOverlay } from "./CyberOverlay";
import VoidEntity from "./VoidEntity";
import VictoryScreen from "./VictoryScreen";
import { getLevelByScore } from "@/config/levels";
import { GameMode } from "@/types/gameModeTypes";
import { unlockAudio } from "@/hooks/useSound";

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
  const isMobileRef = useRef<boolean>(false);

  const {
    score,
    gameOver,
    isVictory,
    shipPosition,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits,
    lives,
    isInvulnerable,
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
    voidEntity,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    submitHighScore,
  } = useGameState();

  updateGameRef.current = updateGame;
  moveShipRef.current = moveShip;
  shootRef.current = shootProjectile;
  shipPositionRef.current = shipPosition;
  gameOverRef.current = gameOver;
  // Keep kbPos in sync when ship moves via mouse/touch so keyboard picks up from correct position
  kbPosRef.current = shipPosition;

  // Unlock audio context as soon as Game mounts (right after user clicked START)
  useEffect(() => { unlockAudio(); }, []);

  const isMobile = useIsMobile();
  isMobileRef.current = isMobile;

  // Mount-once movement handlers — use refs so they never go stale or re-subscribe
  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (gameOverRef.current || !gameContainerRef.current) return;
      const rect = gameContainerRef.current.getBoundingClientRect();
      const position = ((clientX - rect.left) / rect.width) * 100;
      moveShipRef.current(position);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobileRef.current) handleMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    };
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!isMobileRef.current || e.gamma === null || gameOverRef.current) return;
      const gamma = Math.max(-30, Math.min(30, e.gamma));
      moveShipRef.current(((gamma + 30) / 60) * 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("deviceorientation", handleOrientation);
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
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
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
        updateGameRef.current();
        if (keys.has("Space")) {
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

  // Handle click/tap to shoot
  const handleShoot = () => {
    if (!gameOver) {
      shootProjectile();
    }
  };

  // Determine current game mode
  const currentLevelData = getLevelByScore(score);
  const isTunnelMode = currentLevelData.gameMode === GameMode.TUNNEL && tunnelActive;

  return (
    <div 
      ref={gameContainerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${
        tunnelTransition ? 'animate-tunnel-shake animate-tunnel-rotate' : ''
      }`}
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
          <Tunnel />
          <Obstacles obstacles={obstacles} bonusRound={!!bonusRoundEndTime} />
        </>
      )}

      <VoidEntity voidEntity={voidEntity} />
      <SpeedRing ring={speedRing} />
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
      <Spaceship position={shipPosition} isInvulnerable={isInvulnerable} isExploding={gameOver} />
      
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
