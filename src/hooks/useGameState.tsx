
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile, Boss, BossType, BossLaser, Wormhole, ActiveDimension, DimensionType, Ufo, UfoBullet, BonusStar } from "@/types/gameTypes";
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

const DIMENSION_TYPES: DimensionType[] = ['neon_city', 'lava_zone', 'ice_field'];

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
  const [survivalTime, setSurvivalTime] = useState(0);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const [timeWithoutHit, setTimeWithoutHit] = useState(0);
  const [powerUpsCollected, setPowerUpsCollected] = useState(0);
  const [achievementNotifications, setAchievementNotifications] = useState<any[]>([]);
  const [tunnelTransition, setTunnelTransition] = useState(false);
  const [meteorStormWarning, setMeteorStormWarning] = useState(false);
  const [meteorStormActive, setMeteorStormActive] = useState(false);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [bossDefeatedNotice, setBossDefeatedNotice] = useState(false);
  const [wormhole, setWormhole] = useState<Wormhole | null>(null);
  const [activeDimension, setActiveDimension] = useState<ActiveDimension | null>(null);
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
  const [ufos, setUfos] = useState<Ufo[]>([]);
  const [ufoBullets, setUfoBullets] = useState<UfoBullet[]>([]);
  const ufosRef = useRef<Ufo[]>([]);
  const ufoBulletsRef = useRef<UfoBullet[]>([]);
  const nextUfoTimeRef = useRef<number>(Date.now() + 12000 + Math.random() * 8000);
  const lastUfoHitRef = useRef<number>(0);
  const [bonusStar, setBonusStar] = useState<BonusStar | null>(null);
  const [bonusRoundEndTime, setBonusRoundEndTime] = useState<number | null>(null);
  const bonusStarRef = useRef<BonusStar | null>(null);
  const bonusRoundEndTimeRef = useRef<number | null>(null);
  const wormholeRef = useRef<Wormhole | null>(null);
  const activeDimensionRef = useRef<ActiveDimension | null>(null);
  const nextWormholeScoreRef = useRef<number>(1500 + Math.floor(Math.random() * 1500));
  const shipPositionRef = useRef<number>(50);
  const nextSpeedIncreaseRef = useRef<number>(1000);
  // Ice field: target vs actual position for slippery controls
  const iceTargetRef = useRef<number>(50);
  
  const scoreRef = useRef(0);
  const speedRef = useRef(0.5);
  const scoreMultiplierRef = useRef(1);
  const meteorHitsRef = useRef(0);
  const livesRef = useRef(MAX_LIVES);
  const gameOverRef = useRef(false);
  
  const { playSound } = useSound();
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
      const survivalSeconds = Math.floor(survivalTime);

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
        timeWithoutHit
      };

      const unlockedAchievements = AchievementService.checkAchievements(gameStats);

      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach((achievement, index) => {
          setTimeout(() => {
            playSound('achievementUnlock');
            setAchievementNotifications(prev => [...prev, achievement]);
            setTimeout(() => {
              setAchievementNotifications(prev => prev.filter(a => a.id !== achievement.id));
            }, 5000);
          }, index * 500);
        });
      }
    } catch (error) {
      console.error("Failed to submit high score:", error);
    }
  }, [score, meteorHits, currentLevel, survivalTime, powerUpsCollected, lives, consecutiveHits, timeWithoutHit, playSound]);

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
      setTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);
    }
  }, [isInvulnerable, playSound, submitHighScore]);

  const resetGame = useCallback(() => {
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
    setSurvivalTime(0);
    setConsecutiveHits(0);
    setTimeWithoutHit(0);
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
    lastUfoHitRef.current = 0;
    setBonusStar(null);
    setBonusRoundEndTime(null);
    bonusStarRef.current = null;
    bonusRoundEndTimeRef.current = null;
    setWormhole(null);
    setActiveDimension(null);
    wormholeRef.current = null;
    activeDimensionRef.current = null;
    nextWormholeScoreRef.current = 1500 + Math.floor(Math.random() * 1500);
    iceTargetRef.current = 50;
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
  }, [resetObstacleTimer, resetProjectileTimer, resetPowerUps, playSound]);

  const startGame = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const moveShip = useCallback((position: number) => {
    const clamped = Math.max(10, Math.min(90, position));
    if (activeDimensionRef.current?.type === 'ice_field') {
      // Ice: store target, actual position lerps in updateGame
      iceTargetRef.current = clamped;
    } else {
      setShipPosition(clamped);
    }
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
    
    // Update survival time
    const currentTime = Date.now();
    const timeSinceStart = (currentTime - gameStartTimeRef.current) / 1000;
    setSurvivalTime(timeSinceStart);
    
    // Update time without hit
    const timeSinceLastHit = (currentTime - lastHitTimeRef.current) / 1000;
    setTimeWithoutHit(timeSinceLastHit);
    
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
        setTimeout(() => {
          startTunnelMode();
          setTunnelTransition(false);
        }, 2500);
      }

      // Stop tunnel mode if advancing to a level without tunnel mode
      if (newLevel.gameMode !== GameMode.TUNNEL && tunnelActive) {
        setTunnelTransition(true);
        playSound('speedUp');

        // Stop tunnel mode after transition animation
        setTimeout(() => {
          stopTunnelMode();
          setTunnelTransition(false);
        }, 2500);
      }

      // Hide notification after 3 seconds
      setTimeout(() => {
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
          setTimeout(() => {
            if (!isPowerUpActive(PowerUpType.SHIELD)) {
              setIsInvulnerable(false);
            }
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
    
    // Debug log for slow motion
    if (slowMotion !== 1.0) {
    }
    
    // Meteor storm event logic (only in standard mode, after 20s)
    const timeSinceGameStart = (currentTime - gameStartTimeRef.current) / 1000;
    const currentLevelData = getLevelByScore(scoreRef.current);
    const isTunnelMode = currentLevelData.gameMode === GameMode.TUNNEL;

    if (!isTunnelMode && timeSinceGameStart > 20 && currentTime >= nextStormTimeRef.current && !stormActiveRef.current && !stormWarningRef.current) {
      stormWarningRef.current = true;
      setMeteorStormWarning(true);
      setTimeout(() => {
        stormWarningRef.current = false;
        setMeteorStormWarning(false);
        setMeteorStormActive(true);
        stormActiveRef.current = true;
        setTimeout(() => {
          setMeteorStormActive(false);
          stormActiveRef.current = false;
          spawnPowerUp();
          nextStormTimeRef.current = Date.now() + 30000 + Math.random() * 30000;
        }, 8000);
      }, 3000);
    }

    const stormMultiplier = stormActiveRef.current ? 2.5 : 1;

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
        const bossSpeed = 0.4 * slowMotion;
        let nextX = b.x + b.direction * bossSpeed;
        let nextDir = b.direction;
        if (nextX <= 15) { nextX = 15; nextDir = 1; }
        if (nextX >= 85) { nextX = 85; nextDir = -1; }
        const nextY = Math.min(b.y + 0.005 * slowMotion, 28);

        // Attack timing
        const now = Date.now();
        const attackInterval = b.type === 'crusher' ? 1800 : b.type === 'mothership' ? 1400 : 3200;
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
              duration: 1500,
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
      for (const u of ufosRef.current) {
        if (u.isExploding) continue; // drop after explosion frame
        const nextX = u.x + u.vx * slowMotion;
        const nextPhase = u.phase + 0.08 * slowMotion;
        // Chance to fire — every 60-100 frames
        if (Math.random() < 0.012 && currentTime - u.spawnedAt > 400) {
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
      }
      if (updatedUfos.length !== ufosRef.current.length) {
        // UFO left screen → schedule next
        if (updatedUfos.length === 0) {
          nextUfoTimeRef.current = currentTime + 8000 + Math.random() * 10000;
        }
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
    if (ufosRef.current.length > 0 && projectiles.length > 0) {
      const survivingUfos: Ufo[] = [];
      const survivingProjectileIds = new Set(projectiles.map((p) => p.id));
      let hitCount = 0;
      for (const u of ufosRef.current) {
        const uy = u.baseY + Math.sin(u.phase) * 6;
        let killed = false;
        for (const p of projectiles) {
          if (!survivingProjectileIds.has(p.id)) continue;
          const xDiff = Math.abs(u.x - p.x);
          const yDiff = Math.abs(uy - (100 - p.y));
          if (xDiff <= u.size / 2 && yDiff <= u.size / 4 + 3) {
            killed = true;
            survivingProjectileIds.delete(p.id);
            hitCount++;
            break;
          }
        }
        if (!killed) survivingUfos.push(u);
      }
      if (hitCount > 0) {
        playSound('explosion');
        setScore((prev) => prev + 500 * hitCount);
        ufosRef.current = survivingUfos;
        setUfos(survivingUfos);
        setProjectiles((prev) => prev.filter((p) => survivingProjectileIds.has(p.id)));
        if (survivingUfos.length === 0) {
          nextUfoTimeRef.current = currentTime + 8000 + Math.random() * 10000;
        }
      }
    }

    // BONUS STAR — rare spawn (~0.05% chance per frame ≈ once every ~30s)
    if (
      !isTunnelMode &&
      !bossRef.current &&
      !bonusStarRef.current &&
      !bonusRoundEndTimeRef.current &&
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
      } else if (projectiles.length > 0) {
        let hits = 0;
        const survivingIds = new Set(projectiles.map((p) => p.id));
        for (const p of projectiles) {
          const xDiff = Math.abs(s.x - p.x);
          const yDiff = Math.abs(s.y - (100 - p.y));
          if (xDiff <= 3 && yDiff <= 3) {
            hits++;
            survivingIds.delete(p.id);
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
          setProjectiles((prev) => prev.filter((p) => survivingIds.has(p.id)));
        }
      }
    }

    // Bonus round timer — auto-end
    if (bonusRoundEndTimeRef.current && currentTime >= bonusRoundEndTimeRef.current) {
      setBonusRoundEndTime(null);
      bonusRoundEndTimeRef.current = null;
    }

    // Ice field: lerp ship toward target
    if (activeDimensionRef.current?.type === 'ice_field') {
      const cur = shipPositionRef.current;
      const tgt = iceTargetRef.current;
      const lerped = cur + (tgt - cur) * 0.04;
      setShipPosition(Math.max(10, Math.min(90, lerped)));
    }

    // WORMHOLE portal spawn — spawn once, CSS animation handles fade, no per-frame setState
    if (!isTunnelMode && !wormholeRef.current && !activeDimensionRef.current && !bossRef.current && scoreRef.current >= nextWormholeScoreRef.current) {
      const newWH: Wormhole = {
        id: Date.now(),
        x: 20 + Math.random() * 60,
        y: 15 + Math.random() * 50,
        size: 10,
        createdAt: Date.now(),
      };
      setWormhole(newWH);
      wormholeRef.current = newWH;
    }

    // Wormhole: only check collision + expiry (no per-frame state update)
    if (wormholeRef.current) {
      const wh = wormholeRef.current;
      const age = currentTime - wh.createdAt;

      if (age > 5000) {
        // Portal expired
        setWormhole(null);
        wormholeRef.current = null;
        nextWormholeScoreRef.current = scoreRef.current + 2000 + Math.floor(Math.random() * 2000);
      } else {
        // Ship enters wormhole — check collision
        const wR = wh.size / 2;
        if (Math.abs(wh.x - shipPosition) < wR + 5 && Math.abs(wh.y - 85) < wR + 5) {
          const dimType = DIMENSION_TYPES[Math.floor(Math.random() * 3)];
          const dim: ActiveDimension = { type: dimType, endTime: currentTime + 12000 };
          setActiveDimension(dim);
          activeDimensionRef.current = dim;
          setWormhole(null);
          wormholeRef.current = null;
          if (dimType === 'ice_field') iceTargetRef.current = shipPosition;
          playSound('speedUp');
          nextWormholeScoreRef.current = scoreRef.current + 2000 + Math.floor(Math.random() * 2000);
        }
      }
    }

    // Dimension: check expiry only (DimensionOverlay handles its own countdown display)
    if (activeDimensionRef.current) {
      if (currentTime >= activeDimensionRef.current.endTime) {
        setActiveDimension(null);
        activeDimensionRef.current = null;
        iceTargetRef.current = shipPositionRef.current;
      }
    }

    if (isTunnelMode && tunnelActive) {
      // Tunnel mode obstacles
      const newTunnelObstacle = createTunnelObstacle();
      if (newTunnelObstacle) {
        setObstacles(prev => [...prev, newTunnelObstacle]);
      }

      setObstacles(prev => {
        const updated = updateTunnelObstacles(prev, slowMotion);
        return updated;
      });
    } else if (bossRef.current && !bossRef.current.isExploding) {
      // Boss active — pause meteor spawn, but still update existing obstacles
      setObstacles(prev => updateObstacles(prev, slowMotion));
    } else {
      // Standard mode obstacles
      const newObstacle = createObstacle(stormMultiplier);
      if (newObstacle) {
        setObstacles(prev => [...prev, newObstacle]);
      }

      setObstacles(prev => {
        const updated = updateObstacles(prev, slowMotion);
        return updated;
      });
    }
    
    const updatedProjectiles = updateProjectiles(projectiles);
    setProjectiles(updatedProjectiles);
    
    const { obstaclesHit, updatedObstacles: collidedObstacles, newProjectilesList } = 
      checkProjectileCollisions(obstacles, updatedProjectiles);
    
    if (obstaclesHit) {
      playSound('explosion');
      playSound('rumble');
      setMeteorHits(prev => prev + 1);
      setConsecutiveHits(prev => prev + 1);
      setScoreMultiplier(prev => Math.min(prev * 1.2, 8));
      
      // Calculate score based on obstacle type (tunnel mode has inverted scoring)
      let scoreGained = Math.round(50 * scoreMultiplierRef.current * scoreBoost);
      if (bonusRoundEndTimeRef.current) {
        scoreGained = Math.round(500 * scoreBoost);
      } else if (isTunnelMode && tunnelActive) {
        // Find the destroyed obstacle and use its point value
        const destroyedObstacles = collidedObstacles.filter(o => o.isExploding && !obstacles.find(orig => orig.id === o.id && orig.isExploding));
        if (destroyedObstacles.length > 0 && destroyedObstacles[0].points) {
          scoreGained = Math.round(destroyedObstacles[0].points * scoreMultiplierRef.current * scoreBoost);
        }
      }
      
      setScore(prev => prev + scoreGained);
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }

    // Projectile-vs-Boss collision
    if (bossRef.current && !bossRef.current.isExploding) {
      const b = bossRef.current;
      const hitRadius = b.size / 2;
      const survivingProjectiles: typeof updatedProjectiles = [];
      let hitsThisFrame = 0;
      for (const p of updatedProjectiles) {
        const xDiff = Math.abs(b.x - p.x);
        const yDiff = Math.abs(b.y - (100 - p.y));
        if (xDiff <= hitRadius && yDiff <= hitRadius) {
          hitsThisFrame++;
        } else {
          survivingProjectiles.push(p);
        }
      }
      if (hitsThisFrame > 0) {
        playSound('explosion');
        const newHp = b.hp - hitsThisFrame;
        if (newHp <= 0) {
          // Defeated!
          const exploded: Boss = { ...b, hp: 0, isExploding: true };
          setBoss(exploded);
          bossRef.current = exploded;
          setScore(prev => prev + 3000);
          setBossDefeatedNotice(true);
          spawnPowerUp();
          playSound('levelUp');
          defeatedBossTypesRef.current.add(b.type);
          // Clear any in-flight lasers
          setBossLasers([]);
          bossLasersRef.current = [];
          setTimeout(() => {
            setBoss(null);
            bossRef.current = null;
          }, 1500);
          setTimeout(() => setBossDefeatedNotice(false), 3000);
        } else {
          const damaged: Boss = { ...b, hp: newHp };
          setBoss(damaged);
          bossRef.current = damaged;
        }
        setProjectiles(survivingProjectiles);
      }
    }

    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOverRef.current, isTunnelMode && tunnelActive);
    if (shipCollided && !isInvulnerable) {
      if (bonusRoundEndTimeRef.current) {
        // During bonus round, touching a coin = collect (+500), no damage
        playSound('powerUpCollect');
        setScore((prev) => prev + 500);
        // Pop the touched obstacle by clearing all near-ship obstacles
        const shipY = 85;
        setObstacles((prev) => prev.filter((o) => Math.abs(o.x - shipPosition) > 8 || Math.abs(o.y - shipY) > 8));
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
    currentLevel
  ]);

  useEffect(() => {
    startGame();
    playSound('atmosphere');
  }, [startGame, playSound]);

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
    survivalTime,
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
    wormhole,
    activeDimension,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    submitHighScore,
  };
};

export default useGameState;
