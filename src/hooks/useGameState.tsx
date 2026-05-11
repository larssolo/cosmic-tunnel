
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile, Boss, BossType, BossLaser, Ufo, UfoBullet, BonusStar, VoidEntity, VoidCore } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";
import { usePowerUps } from "./usePowerUps";
import { useTunnelMode } from "./useTunnelMode";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import { AchievementService } from "@/services/AchievementService";
import { getLevelByScore } from "@/config/levels";
import { POWER_UP_CONFIGS } from "@/config/powerUps";
import { PowerUpType } from "@/types/powerUpTypes";
import { GameStats } from "@/types/achievementTypes";
import { GameMode } from "@/types/gameModeTypes";

const MAX_LIVES = 3;

const BOSS_BY_LEVEL: Record<number, { type: BossType; name: string; hp: number; size: number }> = {
  5:  { type: 'crusher',     name: 'THE CRUSHER',  hp: 14, size: 22 },
  7:  { type: 'mothership',  name: 'MOTHERSHIP',   hp: 16, size: 24 },
  10: { type: 'laser_beast', name: 'LASER BEAST',  hp: 20, size: 22 },
};

interface SpeedRing { id: number; x: number; y: number; createdAt: number; }

const useGameState = () => {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shipPosition, setShipPosition] = useState(50); // Center position (%)
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [speed, setSpeed] = useState(0.5);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [meteorHits, setMeteorHits] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES); // Initialize with maximum lives
  const [isInvulnerable, setIsInvulnerable] = useState(false); // Add invulnerability state
  
  // New state for features
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelUpNotification, setLevelUpNotification] = useState<{ level: number; name: string } | null>(null);
  const survivalTimeRef = useRef(0);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const timeWithoutHitRef = useRef(0);
  const [powerUpsCollected, setPowerUpsCollected] = useState(0);
  const [achievementNotifications, setAchievementNotifications] = useState<any[]>([]);
  const [tunnelTransition, setTunnelTransition] = useState(false);
  const [meteorStormWarning, setMeteorStormWarning] = useState(false);
  const [meteorStormActive, setMeteorStormActive] = useState(false);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [bossDefeatedNotice, setBossDefeatedNotice] = useState(false);
  const [speedRing, setSpeedRing] = useState<SpeedRing | null>(null);
  const gameStartTimeRef = useRef<number>(Date.now());
  const lastHitTimeRef = useRef<number>(Date.now());
  const nextStormTimeRef = useRef<number>(Date.now() + 30000 + Math.random() * 30000);
  const stormActiveRef = useRef(false);
  const stormWarningRef = useRef(false);
  const bossRef = useRef<Boss | null>(null);
  const defeatedBossTypesRef = useRef<Set<BossType>>(new Set());
  const [bossLasers, setBossLasers] = useState<BossLaser[]>([]);
  const bossLasersRef = useRef<BossLaser[]>([]);
  const lastLaserHitRef = useRef<number>(0);
  const lastVoidHitRef = useRef<number>(0);
  const [ufos, setUfos] = useState<Ufo[]>([]);
  const [ufoBullets, setUfoBullets] = useState<UfoBullet[]>([]);
  const ufosRef = useRef<Ufo[]>([]);
  const ufoBulletsRef = useRef<UfoBullet[]>([]);
  const nextUfoTimeRef = useRef<number>(Date.now() + 12000 + Math.random() * 8000);
  const [bonusStar, setBonusStar] = useState<BonusStar | null>(null);
  const [bonusRoundEndTime, setBonusRoundEndTime] = useState<number | null>(null);
  const bonusStarRef = useRef<BonusStar | null>(null);
  const bonusRoundEndTimeRef = useRef<number | null>(null);
  const [voidEntity, setVoidEntity] = useState<VoidEntity | null>(null);
  const voidEntityRef = useRef<VoidEntity | null>(null);
  const speedRingRef = useRef<SpeedRing | null>(null);
  const nextSpeedRingScoreRef = useRef<number>(1500 + Math.floor(Math.random() * 1500));
  const shipPositionRef = useRef<number>(50);
  const nextSpeedIncreaseRef = useRef<number>(1000);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  const meteorHitsRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const gameOverRef = useRef(false);
  const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    pendingTimeoutsRef.current.push(id);
    return id;
  }, []);
  
  const { playSound, stopSound } = useSound();
  const voidCountdownStartedRef = useRef(false);
  const {
    powerUps,
    activePowerUps,
    spawnPowerUp,
    updatePowerUps,
    activatePowerUp,
    isPowerUpActive,
    removePowerUp,
    resetPowerUps
  } = usePowerUps();
  
  // Sync only the refs that updateGame can't update itself (scalar game state)
  // wormhole/activeDimension/shipPosition are updated directly via refs in updateGame
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
    meteorHitsRef.current = meteorHits;
    livesRef.current = lives;
    gameOverRef.current = gameOver;
  }, [score, speed, scoreMultiplier, meteorHits, lives, gameOver]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();
  const { 
    countdownTime, 
    tunnelActive, 
    startTunnelMode, 
    stopTunnelMode,
    createTunnelObstacle,
    updateTunnelObstacles 
  } = useTunnelMode(scoreRef);

  // Handle score submission — called from UI after player enters their name
  const submitHighScore = useCallback(async (playerName: string) => {
    if (score <= 0) return;

    try {
      const survivalSeconds = Math.floor(survivalTimeRef.current);

      await CloudHighScoreService.saveHighScore(
        playerName,
        score,
        currentLevel,
        meteorHits,
        survivalSeconds
      );

      const gameStats: GameStats = {
        score,
        meteorsHit: meteorHits,
        survivalTime: survivalSeconds,
        livesLost: MAX_LIVES - lives,
        powerUpsCollected,
        highestLevel: currentLevel,
        perfectGame: lives === MAX_LIVES && score >= 5000,
        consecutiveHits,
        timeWithoutHit: timeWithoutHitRef.current
      };

      const unlockedAchievements = AchievementService.checkAchievements(gameStats);

      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach((achievement, index) => {
          safeTimeout(() => {
            playSound('achievementUnlock');
            setAchievementNotifications(prev => [...prev, achievement]);
            safeTimeout(() => {
              setAchievementNotifications(prev => prev.filter(a => a.id !== achievement.id));
            }, 5000);
          }, index * 500);
        });
      }
    } catch (error) {
      console.error("Failed to submit high score:", error);
    }
  }, [score, meteorHits, currentLevel, powerUpsCollected, lives, consecutiveHits, playSound, safeTimeout]);

  // Handle ship being hit
  const handleShipHit = useCallback(() => {
    if (isInvulnerable || gameOverRef.current) return;
    
    setLives(prev => prev - 1);
    if (livesRef.current - 1 <= 0) {
      // Game over when no lives left
      setGameOver(true);
      gameOverRef.current = true;
      playSound('crash');
    } else {
      // Set temporary invulnerability
      setIsInvulnerable(true);
      playSound('crash');
      
      // Reset invulnerability after 2 seconds
      safeTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);
    }
  }, [isInvulnerable, playSound, safeTimeout]);

  const resetGame = useCallback(() => {
    pendingTimeoutsRef.current.forEach(clearTimeout);
    pendingTimeoutsRef.current = [];
    setScore(0);
    setGameOver(false);
    setShipPosition(50);
    setObstacles([]);
    setProjectiles([]);
    setSpeed(0.5);
    setScoreMultiplier(1);
    setMeteorHits(0);
    setLives(MAX_LIVES);
    setIsInvulnerable(false);
    setCurrentLevel(1);
    survivalTimeRef.current = 0;
    setConsecutiveHits(0);
    timeWithoutHitRef.current = 0;
    setPowerUpsCollected(0);
    setLevelUpNotification(null);
    setAchievementNotifications([]);
    setMeteorStormWarning(false);
    setMeteorStormActive(false);
    stormActiveRef.current = false;
    stormWarningRef.current = false;
    nextStormTimeRef.current = Date.now() + 30000 + Math.random() * 30000;
    setBoss(null);
    setBossDefeatedNotice(false);
    bossRef.current = null;
    defeatedBossTypesRef.current = new Set();
    setBossLasers([]);
    bossLasersRef.current = [];
    setUfos([]);
    setUfoBullets([]);
    ufosRef.current = [];
    ufoBulletsRef.current = [];
    nextUfoTimeRef.current = Date.now() + 12000 + Math.random() * 8000;
    setBonusStar(null);
    setBonusRoundEndTime(null);
    bonusStarRef.current = null;
    bonusRoundEndTimeRef.current = null;
    setVoidEntity(null);
    voidEntityRef.current = null;
    lastVoidHitRef.current = 0;
    voidCountdownStartedRef.current = false;
    stopSound('voidCountdown');
    setSpeedRing(null);
    speedRingRef.current = null;
    nextSpeedRingScoreRef.current = 1500 + Math.floor(Math.random() * 1500);
    stopTunnelMode();
    resetObstacleTimer();
    resetProjectileTimer();
    resetPowerUps();
    scoreRef.current = 0;
    speedRef.current = 0.5;
    nextSpeedIncreaseRef.current = 1000;
    scoreMultiplierRef.current = 1;
    meteorHitsRef.current = 0;
    livesRef.current = MAX_LIVES;
    gameOverRef.current = false;
    gameStartTimeRef.current = Date.now();
    lastHitTimeRef.current = Date.now();
    playSound('start');
    playSound('atmosphere');
  }, [resetObstacleTimer, resetProjectileTimer, resetPowerUps, playSound, stopSound]);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const moveShip = useCallback((position: number) => {
    setShipPosition(Math.max(10, Math.min(90, position)));
  }, []);

  const shootProjectile = useCallback(() => {
    const rapidFire = isPowerUpActive(PowerUpType.RAPID_FIRE);
    const newProjectile = createProjectile(shipPosition, gameOverRef.current, rapidFire);
    if (newProjectile) {
      setProjectiles(prev => [...prev, newProjectile]);
      playSound('shoot');
    }
  }, [shipPosition, createProjectile, playSound, isPowerUpActive]);

  const updateGame = useCallback(() => {
    if (gameOverRef.current) return;
    
    // Update survival/hit-time refs (no setState — only read at game-over submission)
    const currentTime = Date.now();
    const timeSinceStart = (currentTime - gameStartTimeRef.current) / 1000;
    survivalTimeRef.current = timeSinceStart;
    timeWithoutHitRef.current = (currentTime - lastHitTimeRef.current) / 1000;
    
    // Apply score boost power-up
    const scoreBoost = isPowerUpActive(PowerUpType.SCORE_BOOST) ? 2 : 1;
    setScore(prev => prev + Math.round(1 * scoreMultiplierRef.current * scoreBoost));
    
    // Check for level progression on every update
    const newLevel = getLevelByScore(scoreRef.current);
    if (newLevel.level > currentLevel) {
      setCurrentLevel(newLevel.level);
      setLevelUpNotification({ level: newLevel.level, name: newLevel.name });
      playSound('levelUp');

      // Start tunnel mode for Level 6
      if (newLevel.level === 6 && newLevel.gameMode === GameMode.TUNNEL) {
        setTunnelTransition(true);
        playSound('speedUp'); // Use as transition sound

        // Start tunnel mode after transition animation
        safeTimeout(() => {
          startTunnelMode();
          setTunnelTransition(false);
        }, 2500);
      }

      // Stop tunnel mode if advancing to a level without tunnel mode
      if (newLevel.gameMode !== GameMode.TUNNEL && tunnelActive) {
        setTunnelTransition(true);
        playSound('speedUp');

        // Stop tunnel mode after transition animation
        safeTimeout(() => {
          stopTunnelMode();
          setTunnelTransition(false);
        }, 2500);
      }

      // Hide notification after 3 seconds
      safeTimeout(() => {
        setLevelUpNotification(null);
      }, 3000);
    }
    
    // Check if tunnel countdown expired
    if (tunnelActive && countdownTime <= 0) {
      stopTunnelMode();
      setGameOver(true);
      gameOverRef.current = true;
      playSound('crash');
    }
    
    // Spawn power-ups
    spawnPowerUp();
    updatePowerUps();
    
    // Check for power-up collisions - FIXED collision detection
    powerUps.forEach(powerUp => {
      const powerUpX = powerUp.x;
      const powerUpY = powerUp.y;
      const shipX = shipPosition;
      const shipY = 85; // Ship is at 85% from top
      
      // Improved collision detection
      const distanceX = Math.abs(powerUpX - shipX);
      const distanceY = Math.abs(powerUpY - shipY);
      
      // Power-up collected when within range
      if (distanceX < 8 && distanceY < 8) {
        // Power-up collected!
        playSound('powerUpCollect');
        setPowerUpsCollected(prev => prev + 1);
        removePowerUp(powerUp.id);
        
        const config = POWER_UP_CONFIGS[powerUp.type];
        
        if (powerUp.type === PowerUpType.HEALTH) {
          // Instant health restoration
          setLives(prev => Math.min(prev + 1, 5)); // Max 5 lives
        } else if (powerUp.type === PowerUpType.SHIELD) {
          // Shield makes ship invulnerable
          activatePowerUp(powerUp.type, config.duration);
          setIsInvulnerable(true);
          safeTimeout(() => {
            setIsInvulnerable(false);
          }, config.duration);
        } else {
          // Other power-ups (including slow motion)
          activatePowerUp(powerUp.type, config.duration);
        }
      }
    });
    
    // Gradual speed increase every 1000 score points (threshold-based so jumps can't skip it)
    if (scoreRef.current >= nextSpeedIncreaseRef.current) {
      nextSpeedIncreaseRef.current += 1000;
      setSpeed(prev => Math.min(prev + 0.05, 2.0));
      playSound('speedUp');
    }
    
    // Apply slow motion power-up to obstacle speed
    const slowMotion = isPowerUpActive(PowerUpType.SLOW_MOTION) ? 0.5 : 1.0;
    
    // Meteor storm event logic (only in standard mode, after 20s)
    const timeSinceGameStart = (currentTime - gameStartTimeRef.current) / 1000;
    const currentLevelData = getLevelByScore(scoreRef.current);
    const isTunnelMode = currentLevelData.gameMode === GameMode.TUNNEL;

    if (!isTunnelMode && timeSinceGameStart > 20 && currentTime >= nextStormTimeRef.current && !stormActiveRef.current && !stormWarningRef.current) {
      stormWarningRef.current = true;
      setMeteorStormWarning(true);
      safeTimeout(() => {
        stormWarningRef.current = false;
        setMeteorStormWarning(false);
        setMeteorStormActive(true);
        stormActiveRef.current = true;
        safeTimeout(() => {
          setMeteorStormActive(false);
          stormActiveRef.current = false;
          spawnPowerUp();
          nextStormTimeRef.current = Date.now() + 30000 + Math.random() * 30000;
        }, 8000);
      }, 3000);
    }

    const stormMultiplier = stormActiveRef.current ? 1.7 : 1;

    // BOSS spawn — at specific level milestones (5, 7, 10), each only once per run
    if (!isTunnelMode && !bossRef.current && BOSS_BY_LEVEL[currentLevel] && !defeatedBossTypesRef.current.has(BOSS_BY_LEVEL[currentLevel].type)) {
      const cfg = BOSS_BY_LEVEL[currentLevel];
      const newBoss: Boss = {
        id: Date.now(),
        type: cfg.type,
        name: cfg.name,
        x: 50,
        y: 18,
        hp: cfg.hp,
        maxHp: cfg.hp,
        direction: Math.random() > 0.5 ? 1 : -1,
        size: cfg.size,
        lastAttackAt: Date.now(),
      };
      setBoss(newBoss);
      bossRef.current = newBoss;
      playSound('speedUp');
    }

    // BOSS movement + attacks + collisions
    if (bossRef.current) {
      const b = bossRef.current;
      if (!b.isExploding) {
        // Laser Beast is now ~2.2× faster and weaves vertically so it can't be predicted
        const baseBossSpeed = b.type === 'laser_beast' ? 0.9 : 0.4;
        const bossSpeed = baseBossSpeed * slowMotion;
        let nextX = b.x + b.direction * bossSpeed;
        let nextDir = b.direction;
        if (nextX <= 15) { nextX = 15; nextDir = 1; }
        if (nextX >= 85) { nextX = 85; nextDir = -1; }
        const baseY = Math.min(b.y + 0.005 * slowMotion, 28);
        const nextY = b.type === 'laser_beast'
          ? Math.max(10, Math.min(28, baseY + Math.sin(Date.now() / 380) * 4))
          : baseY;

        // Attack timing
        const now = Date.now();
        const attackInterval = b.type === 'crusher' ? 1800 : b.type === 'mothership' ? 1400 : 2400;
        let nextAttackAt = b.lastAttackAt ?? now;
        if (now - nextAttackAt >= attackInterval) {
          nextAttackAt = now;
          if (b.type === 'crusher') {
            // Wave of 3 large boulders
            const wave: Obstacle[] = [-12, 0, 12].map((dx, i) => ({
              id: now + i,
              x: Math.max(8, Math.min(92, nextX + dx)),
              y: nextY + 5,
              size: 13 + Math.random() * 3,
            }));
            setObstacles(prev => [...prev, ...wave]);
            playSound('rumble');
          } else if (b.type === 'mothership') {
            // Spawn fast small minion
            const minion: Obstacle = {
              id: now,
              x: nextX + (Math.random() - 0.5) * 10,
              y: nextY + 3,
              size: 5 + Math.random() * 2,
            };
            setObstacles(prev => [...prev, minion]);
          } else {
            // Laser beast: emit a charging+firing laser at ship's column
            const laser: BossLaser = {
              id: now,
              x: shipPositionRef.current,
              startedAt: now,
              duration: 800,
            };
            setBossLasers(prev => {
              const next = [...prev, laser];
              bossLasersRef.current = next;
              return next;
            });
          }
        }

        const updated: Boss = { ...b, x: nextX, y: nextY, direction: nextDir as 1 | -1, lastAttackAt: nextAttackAt };
        setBoss(updated);
        bossRef.current = updated;

        // Ship collision with boss body
        const shipY = 85;
        if (Math.abs(updated.x - shipPosition) < (updated.size / 2 + 6) && Math.abs(updated.y - shipY) < 12 && !isInvulnerable) {
          handleShipHit();
          const bumped: Boss = { ...updated, y: 15 };
          setBoss(bumped);
          bossRef.current = bumped;
        }
      }
    }

    // Boss laser cleanup + ship-vs-laser collision
    if (bossLasersRef.current.length > 0) {
      const nowL = Date.now();
      const surviving: BossLaser[] = [];
      for (const l of bossLasersRef.current) {
        const elapsed = nowL - l.startedAt;
        if (elapsed >= l.duration) continue;
        surviving.push(l);
        // Damage only during firing phase (after 600ms charge) — rate-limited to once per invuln window
        if (elapsed >= 600 && !isInvulnerable && Math.abs(l.x - shipPosition) < 4 && nowL - lastLaserHitRef.current > 2100) {
          lastLaserHitRef.current = nowL;
          handleShipHit();
        }
      }
      if (surviving.length !== bossLasersRef.current.length) {
        bossLasersRef.current = surviving;
        setBossLasers(surviving);
      }
    }

    // Move projectiles ONCE at the start of this frame; all subsequent collision
    // checks share `liveProjectiles` so a projectile can only ever be consumed once.
    const movedProjectiles = updateProjectiles(projectiles);
    let liveProjectiles = movedProjectiles;
    const consumedProjectileIds = new Set<number>();

    // UFO INVADERS — spawn, move (zigzag), shoot, collide
    if (!isTunnelMode && !bossRef.current && ufosRef.current.length === 0 && currentTime >= nextUfoTimeRef.current) {
      const fromLeft = Math.random() > 0.5;
      const newUfo: Ufo = {
        id: currentTime,
        x: fromLeft ? -8 : 108,
        baseY: 18 + Math.random() * 25,
        size: 9,
        vx: (fromLeft ? 1 : -1) * (0.35 + Math.random() * 0.2),
        phase: Math.random() * Math.PI * 2,
        spawnedAt: currentTime,
      };
      setUfos([newUfo]);
      ufosRef.current = [newUfo];
      nextUfoTimeRef.current = currentTime + 999999; // re-armed when UFO leaves/dies
    }

    if (ufosRef.current.length > 0) {
      const updatedUfos: Ufo[] = [];
      let aliveCount = 0;
      for (const u of ufosRef.current) {
        if (u.isExploding) {
          // Keep the exploding sprite on screen until its setTimeout removes it
          updatedUfos.push(u);
          continue;
        }
        const nextX = u.x + u.vx * slowMotion;
        const nextPhase = u.phase + 0.08 * slowMotion;
        // Chance to fire — ~0.3 shots/sec (every ~200 frames)
        if (Math.random() < 0.005 && currentTime - u.spawnedAt > 600) {
          const ufoY = u.baseY + Math.sin(nextPhase) * 6;
          const bullet: UfoBullet = {
            id: currentTime + Math.floor(Math.random() * 1000),
            x: nextX,
            y: ufoY + 4,
            vy: 0.9,
          };
          ufoBulletsRef.current = [...ufoBulletsRef.current, bullet];
          setUfoBullets(ufoBulletsRef.current);
        }
        // Off-screen exit
        if (nextX < -12 || nextX > 112) {
          continue;
        }
        updatedUfos.push({ ...u, x: nextX, phase: nextPhase });
        aliveCount++;
      }
      if (aliveCount === 0 && updatedUfos.every((u) => !u.isExploding)) {
        // Everything left/dead, schedule next UFO
        nextUfoTimeRef.current = currentTime + 8000 + Math.random() * 10000;
      }
      ufosRef.current = updatedUfos;
      setUfos(updatedUfos);
    }

    // UFO bullets: move, hit ship, cleanup
    if (ufoBulletsRef.current.length > 0) {
      const survivingBullets: UfoBullet[] = [];
      const shipY = 85;
      for (const b of ufoBulletsRef.current) {
        const ny = b.y + b.vy * slowMotion;
        if (ny > 100) continue;
        if (!isInvulnerable && Math.abs(b.x - shipPosition) < 4 && Math.abs(ny - shipY) < 5) {
          handleShipHit();
          continue; // bullet absorbed
        }
        survivingBullets.push({ ...b, y: ny });
      }
      ufoBulletsRef.current = survivingBullets;
      setUfoBullets(survivingBullets);
    }

    // Projectile-vs-UFO collisions
    if (ufosRef.current.length > 0 && liveProjectiles.length > 0) {
      const updatedUfosAfterHits: Ufo[] = [];
      let hitCount = 0;
      let aliveUfosLeft = 0;
      for (const u of ufosRef.current) {
        if (u.isExploding) {
          updatedUfosAfterHits.push(u);
          continue;
        }
        const uy = u.baseY + Math.sin(u.phase) * 6;
        let killed = false;
        for (const p of liveProjectiles) {
          if (consumedProjectileIds.has(p.id)) continue;
          const xDiff = Math.abs(u.x - p.x);
          const yDiff = Math.abs(uy - (100 - p.y));
          if (xDiff <= u.size / 2 && yDiff <= u.size / 4 + 3) {
            killed = true;
            consumedProjectileIds.add(p.id);
            hitCount++;
            break;
          }
        }
        if (killed) {
          // Mark exploding; remove after a short delay so the animation shows
          const exploding: Ufo = { ...u, isExploding: true };
          updatedUfosAfterHits.push(exploding);
          safeTimeout(() => {
            ufosRef.current = ufosRef.current.filter((x) => x.id !== u.id);
            setUfos(ufosRef.current);
            if (ufosRef.current.length === 0) {
              nextUfoTimeRef.current = Date.now() + 8000 + Math.random() * 10000;
            }
          }, 400);
        } else {
          updatedUfosAfterHits.push(u);
          aliveUfosLeft++;
        }
      }
      if (hitCount > 0) {
        playSound('explosion');
        setScore((prev) => prev + 500 * hitCount);
        ufosRef.current = updatedUfosAfterHits;
        setUfos(updatedUfosAfterHits);
      }
    }

    // BONUS STAR — rare spawn (~0.05% chance per frame ≈ once every ~30s)
    if (
      !isTunnelMode &&
      !bossRef.current &&
      !bonusStarRef.current &&
      !bonusRoundEndTimeRef.current &&
      !stormActiveRef.current &&
      !stormWarningRef.current &&
      timeSinceGameStart > 15 &&
      Math.random() < 0.0005
    ) {
      const star: BonusStar = {
        id: currentTime,
        x: 20 + Math.random() * 60,
        y: 25 + Math.random() * 35,
        hp: 15,
        maxHp: 15,
        spawnedAt: currentTime,
      };
      setBonusStar(star);
      bonusStarRef.current = star;
    }

    // Bonus star: auto-despawn after 12s, or take projectile damage
    if (bonusStarRef.current) {
      const s = bonusStarRef.current;
      if (currentTime - s.spawnedAt > 12000) {
        setBonusStar(null);
        bonusStarRef.current = null;
      } else if (liveProjectiles.length > 0) {
        let hits = 0;
        for (const p of liveProjectiles) {
          if (consumedProjectileIds.has(p.id)) continue;
          const xDiff = Math.abs(s.x - p.x);
          const yDiff = Math.abs(s.y - (100 - p.y));
          if (xDiff <= 3 && yDiff <= 3) {
            hits++;
            consumedProjectileIds.add(p.id);
          }
        }
        if (hits > 0) {
          playSound('shoot');
          const newHp = s.hp - hits;
          if (newHp <= 0) {
            // BONUS ROUND TRIGGERED!
            playSound('levelUp');
            playSound('powerUpCollect');
            setBonusStar(null);
            bonusStarRef.current = null;
            const endAt = currentTime + 15000;
            setBonusRoundEndTime(endAt);
            bonusRoundEndTimeRef.current = endAt;
            // Clear active obstacles so the round starts clean with coins
            setObstacles([]);
          } else {
            const damaged: BonusStar = { ...s, hp: newHp };
            setBonusStar(damaged);
            bonusStarRef.current = damaged;
          }
        }
      }
    }

    // Bonus round timer — auto-end
    if (bonusRoundEndTimeRef.current && currentTime >= bonusRoundEndTimeRef.current) {
      setBonusRoundEndTime(null);
      bonusRoundEndTimeRef.current = null;
    }

    // SPEED RING — spawns every ~2000 score, floats down, collect for +1500 pts + score boost
    if (!isTunnelMode && !speedRingRef.current && !bossRef.current && scoreRef.current >= nextSpeedRingScoreRef.current) {
      const ring: SpeedRing = { id: currentTime, x: 15 + Math.random() * 70, y: -8, createdAt: currentTime };
      setSpeedRing(ring);
      speedRingRef.current = ring;
    }

    if (speedRingRef.current) {
      const ring = speedRingRef.current;
      const newY = ring.y + 0.25 * slowMotion;
      if (newY > 105) {
        // Drifted off screen
        setSpeedRing(null);
        speedRingRef.current = null;
        nextSpeedRingScoreRef.current = scoreRef.current + 1800 + Math.floor(Math.random() * 1200);
      } else if (Math.abs(ring.x - shipPosition) < 7 && Math.abs(newY - 85) < 7) {
        // Collected!
        playSound('levelUp');
        setScore(prev => prev + 1500);
        activatePowerUp(PowerUpType.SCORE_BOOST, 8000);
        setSpeedRing(null);
        speedRingRef.current = null;
        nextSpeedRingScoreRef.current = scoreRef.current + 1800 + Math.floor(Math.random() * 1200);
      } else {
        speedRingRef.current = { ...ring, y: newY };
        // Only re-render every ~4 frames to cut down on unnecessary React renders
        if (Math.round(newY * 4) !== Math.round(ring.y * 4)) {
          setSpeedRing(speedRingRef.current);
        }
      }
    }

    if (isTunnelMode && tunnelActive) {
      // Tunnel mode obstacles — single setState to avoid stale-prev race
      const newTunnelObstacle = createTunnelObstacle();
      setObstacles(prev => {
        const withNew = newTunnelObstacle ? [...prev, newTunnelObstacle] : prev;
        return updateTunnelObstacles(withNew, slowMotion);
      });
    } else if (bossRef.current && !bossRef.current.isExploding) {
      // Boss active — pause meteor spawn, but still update existing obstacles
      setObstacles(prev => updateObstacles(prev, slowMotion));
    } else {
      // Standard mode obstacles — pass current obstacles so spawn can avoid overlaps
      const newObstacle = createObstacle(stormMultiplier, obstacles);
      setObstacles(prev => {
        const withNew = newObstacle ? [...prev, newObstacle] : prev;
        return updateObstacles(withNew, slowMotion);
      });
    }
    
    // Filter to only projectiles not already consumed by UFO/bonus star this frame
    const projectilesForMeteorCheck = liveProjectiles.filter((p) => !consumedProjectileIds.has(p.id));
    const { hitCount: meteorHitCount, destroyedObstacles, newProjectilesList } =
      checkProjectileCollisions(obstacles, projectilesForMeteorCheck);

    if (meteorHitCount > 0) {
      playSound('explosion');
      playSound('rumble');
      setMeteorHits(prev => prev + meteorHitCount);
      setConsecutiveHits(prev => prev + meteorHitCount);
      setScoreMultiplier(prev => Math.min(prev * Math.pow(1.2, meteorHitCount), 8));

      // Mark destroyed obstacle IDs; apply via functional update to keep moved positions
      const destroyedIds = new Set(destroyedObstacles.map((o) => o.id));
      setObstacles(prev => prev.map(o => destroyedIds.has(o.id) ? { ...o, isExploding: true } : o));

      // Per-hit base score
      const survivingIdsAfterMeteor = new Set(newProjectilesList.map((p) => p.id));
      for (const p of projectilesForMeteorCheck) {
        if (!survivingIdsAfterMeteor.has(p.id)) consumedProjectileIds.add(p.id);
      }

      if (bonusRoundEndTimeRef.current) {
        setScore(prev => prev + Math.round(500 * scoreBoost) * meteorHitCount);
      } else if (isTunnelMode && tunnelActive) {
        // Tunnel mode obstacles have variable point values
        const totalTunnelScore = destroyedObstacles.reduce((sum, o) => {
          const pts = o.points ?? 50;
          return sum + Math.round(pts * scoreMultiplierRef.current * scoreBoost);
        }, 0);
        setScore(prev => prev + totalTunnelScore);
      } else {
        const scorePerHit = Math.round(50 * scoreMultiplierRef.current * scoreBoost);
        setScore(prev => prev + scorePerHit * meteorHitCount);
      }
    }

    // Projectile-vs-Boss collision
    if (bossRef.current && !bossRef.current.isExploding) {
      const b = bossRef.current;
      const hitRadius = b.size / 2;
      let hitsThisFrame = 0;
      for (const p of liveProjectiles) {
        if (consumedProjectileIds.has(p.id)) continue;
        const xDiff = Math.abs(b.x - p.x);
        const yDiff = Math.abs(b.y - (100 - p.y));
        if (xDiff <= hitRadius && yDiff <= hitRadius) {
          hitsThisFrame++;
          consumedProjectileIds.add(p.id);
        }
      }
      if (hitsThisFrame > 0) {
        playSound('explosion');
        const newHp = b.hp - hitsThisFrame;
        if (newHp <= 0) {
          const exploded: Boss = { ...b, hp: 0, isExploding: true };
          setBoss(exploded);
          bossRef.current = exploded;
          setScore(prev => prev + 3000);
          setBossDefeatedNotice(true);
          spawnPowerUp();
          playSound('levelUp');
          defeatedBossTypesRef.current.add(b.type);
          setBossLasers([]);
          bossLasersRef.current = [];
          safeTimeout(() => {
            setBoss(null);
            bossRef.current = null;
          }, 1500);
          safeTimeout(() => setBossDefeatedNotice(false), 3000);
        } else {
          const damaged: Boss = { ...b, hp: newHp };
          setBoss(damaged);
          bossRef.current = damaged;
        }
      }
    }

    // THE VOID AWAKENS — trigger after 5 minutes of survival
    const VOID_TRIGGER_SECONDS = 300; // 5 minutes
    const VOID_DURATION_MS = 60000;   // 60 seconds to survive
    if (!voidEntityRef.current && timeSinceGameStart >= VOID_TRIGGER_SECONDS && !isTunnelMode) {
      const cores: VoidCore[] = [
        { id: 0, x: 20, destroyed: false },
        { id: 1, x: 50, destroyed: false },
        { id: 2, x: 80, destroyed: false },
      ];
      const newVoid: VoidEntity = {
        startedAt: currentTime,
        duration: VOID_DURATION_MS,
        cores,
      };
      setVoidEntity(newVoid);
      voidEntityRef.current = newVoid;
      voidCountdownStartedRef.current = false;
      playSound('voidSpawn');
    }

    if (voidEntityRef.current) {
      const ve = voidEntityRef.current;
      const voidElapsed = currentTime - ve.startedAt;
      const voidProgress = Math.min(voidElapsed / VOID_DURATION_MS, 1);
      const newRiseY = voidProgress * 85;

      // Check if the void has consumed the ship (ship at y=85%, void top at 100-newRiseY% from top)
      // Rate-limited to once per 2100ms — same window as the invulnerability period
      const voidTopPct = 100 - newRiseY;
      if (voidTopPct <= 86 && !isInvulnerable && currentTime - lastVoidHitRef.current > 2100) {
        lastVoidHitRef.current = currentTime;
        handleShipHit();
      }

      // Projectile vs void cores — only setState when a core is actually destroyed
      if (liveProjectiles.length > 0) {
        let coreHits = 0;
        const updatedCores = ve.cores.map(core => {
          if (core.destroyed) return core;
          const coreY = voidTopPct + 10 + (core.id % 3) * 8;
          for (const p of liveProjectiles) {
            if (consumedProjectileIds.has(p.id)) continue;
            if (Math.abs(core.x - p.x) < 5 && Math.abs(coreY - (100 - p.y)) < 5) {
              consumedProjectileIds.add(p.id);
              coreHits++;
              return { ...core, destroyed: true };
            }
          }
          return core;
        });
        if (coreHits > 0) {
          playSound('voidCoreHit');
          setScore(prev => prev + 1000 * coreHits);
          const updated: VoidEntity = { ...ve, cores: updatedCores };
          setVoidEntity(updated);
          voidEntityRef.current = updated;
        }
      }

      // Start countdown alarm in the last 10 seconds
      if (VOID_DURATION_MS - voidElapsed <= 10000 && !voidCountdownStartedRef.current) {
        voidCountdownStartedRef.current = true;
        playSound('voidCountdown');
      }

      // Void duration expired — game over, final score bonus (guard prevents firing 60x/sec)
      if (voidElapsed >= VOID_DURATION_MS && !gameOverRef.current) {
        stopSound('voidCountdown');
        const survivedCores = ve.cores.filter(c => !c.destroyed).length;
        if (survivedCores === 0) {
          setScore(prev => prev + 5000);
          playSound('voidAllCores');
        } else {
          playSound('crash');
        }
        setGameOver(true);
        gameOverRef.current = true;
      }
    }

    // Apply all projectile changes for this frame in ONE setState
    if (consumedProjectileIds.size > 0) {
      setProjectiles(liveProjectiles.filter((p) => !consumedProjectileIds.has(p.id)));
    } else {
      setProjectiles(liveProjectiles);
    }

    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOverRef.current, isTunnelMode && tunnelActive);
    if (shipCollided && !isInvulnerable) {
      if (bonusRoundEndTimeRef.current) {
        // During bonus round, each touched coin = +500 (count them)
        playSound('powerUpCollect');
        const shipY = 85;
        const collected = obstacles.filter(
          (o) => !o.isExploding && Math.abs(o.x - shipPosition) <= 8 && Math.abs(o.y - shipY) <= 8
        );
        if (collected.length > 0) {
          setScore((prev) => prev + 500 * collected.length);
          const collectedIds = new Set(collected.map((o) => o.id));
          setObstacles((prev) => prev.filter((o) => !collectedIds.has(o.id)));
        }
      } else {
        setConsecutiveHits(0);
        lastHitTimeRef.current = Date.now();
        handleShipHit();
      }
    }
  }, [
    createObstacle, 
    updateObstacles, 
    updateProjectiles, 
    checkProjectileCollisions, 
    checkShipCollision, 
    obstacles, 
    projectiles, 
    shipPosition,
    playSound,
    isInvulnerable,
    handleShipHit,
    isPowerUpActive,
    spawnPowerUp,
    updatePowerUps,
    powerUps,
    removePowerUp,
    activatePowerUp,
    currentLevel,
    tunnelActive,
    countdownTime,
    safeTimeout
  ]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return {
    score,
    gameOver,
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
    ufos,
    ufoBullets,
    bonusStar,
    bonusRoundEndTime,
    speedRing,
    voidEntity,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    submitHighScore,
  };
};

export default useGameState;
