
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile, Boss } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";
import { usePowerUps } from "./usePowerUps";
import { useTunnelMode } from "./useTunnelMode";
import { CloudHighScoreService } from "@/services/CloudHighScoreService";
import { CloudAchievementService } from "@/services/CloudAchievementService";
import { CloudStatisticsService } from "@/services/CloudStatisticsService";
import { AchievementService } from "@/services/AchievementService";
import { getLevelByScore, LEVELS } from "@/config/levels";
import { POWER_UP_CONFIGS } from "@/config/powerUps";
import { PowerUpType } from "@/types/powerUpTypes";
import { GameStats } from "@/types/achievementTypes";
import { GameMode } from "@/types/gameModeTypes";

const MAX_LIVES = 3;

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
  const gameStartTimeRef = useRef<number>(Date.now());
  const lastHitTimeRef = useRef<number>(Date.now());
  const nextStormTimeRef = useRef<number>(Date.now() + 30000 + Math.random() * 30000);
  const stormActiveRef = useRef(false);
  const stormWarningRef = useRef(false);
  const bossRef = useRef<Boss | null>(null);
  const nextBossScoreRef = useRef<number>(3000);
  
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
  
  useEffect(() => {
    scoreRef.current = score;
    speedRef.current = speed;
    scoreMultiplierRef.current = scoreMultiplier;
    meteorHitsRef.current = meteorHits;
    livesRef.current = lives;
    gameOverRef.current = gameOver;
    bossRef.current = boss;
  }, [score, speed, scoreMultiplier, meteorHits, lives, gameOver, boss]);

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
    nextBossScoreRef.current = 3000;
    resetObstacleTimer();
    resetProjectileTimer();
    resetPowerUps();
    scoreRef.current = 0;
    speedRef.current = 0.5;
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
    const clampedPosition = Math.max(10, Math.min(90, position));
    setShipPosition(clampedPosition);
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
        console.log('Starting Level 6 Tunnel Mode!');
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
        console.log(`Exiting Tunnel Mode - Advancing to Level ${newLevel.level}!`);
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
        console.log(`Power-up collected: ${powerUp.type} at position (${powerUpX}, ${powerUpY})`);
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
          console.log(`Activating power-up: ${powerUp.type} for ${config.duration}ms`);
          activatePowerUp(powerUp.type, config.duration);
        }
      }
    });
    
    // Gradual speed increase - REDUCED from every 500 to every 1000 points
    if (scoreRef.current > 0 && scoreRef.current % 1000 === 0) {
      setSpeed(prev => Math.min(prev + 0.05, 2.0)); // Reduced increment from 0.1 to 0.05, max from 3.0 to 2.0
      playSound('speedUp');
    }
    
    // Apply slow motion power-up to obstacle speed
    const slowMotion = isPowerUpActive(PowerUpType.SLOW_MOTION) ? 0.5 : 1.0;
    
    // Debug log for slow motion
    if (slowMotion !== 1.0) {
      console.log('Slow motion active! Multiplier:', slowMotion);
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

    // BOSS spawn — every 3000 score points in standard mode, when none active
    if (!isTunnelMode && !bossRef.current && scoreRef.current >= nextBossScoreRef.current) {
      const newBoss: Boss = {
        id: Date.now(),
        x: 50,
        y: 15,
        hp: 12,
        maxHp: 12,
        direction: Math.random() > 0.5 ? 1 : -1,
        size: 18,
      };
      setBoss(newBoss);
      bossRef.current = newBoss;
      playSound('speedUp');
    }

    // BOSS movement + collisions
    if (bossRef.current) {
      const b = bossRef.current;
      if (!b.isExploding) {
        const bossSpeed = 0.4 * slowMotion;
        let nextX = b.x + b.direction * bossSpeed;
        let nextDir = b.direction;
        if (nextX <= 15) { nextX = 15; nextDir = 1; }
        if (nextX >= 85) { nextX = 85; nextDir = -1; }
        const nextY = Math.min(b.y + 0.02 * slowMotion, 35);
        const updated: Boss = { ...b, x: nextX, y: nextY, direction: nextDir as 1 | -1 };
        setBoss(updated);
        bossRef.current = updated;

        // Ship collision with boss
        const shipY = 85;
        if (Math.abs(updated.x - shipPosition) < (updated.size / 2 + 6) && Math.abs(updated.y - shipY) < 12 && !isInvulnerable) {
          handleShipHit();
          // Knock boss back up
          const bumped: Boss = { ...updated, y: 15 };
          setBoss(bumped);
          bossRef.current = bumped;
        }
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
      setScoreMultiplier(prev => prev * 1.2);
      
      // Calculate score based on obstacle type (tunnel mode has inverted scoring)
      let scoreGained = Math.round(50 * scoreMultiplierRef.current * scoreBoost);
      if (isTunnelMode && tunnelActive) {
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
          setScore(prev => prev + 2000);
          setBossDefeatedNotice(true);
          spawnPowerUp();
          playSound('levelUp');
          nextBossScoreRef.current += 3000;
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
      setConsecutiveHits(0);
      lastHitTimeRef.current = Date.now();
      handleShipHit();
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
    bossDefeatedNotice,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    submitHighScore,
  };
};

export default useGameState;
