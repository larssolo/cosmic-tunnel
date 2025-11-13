
import { useState, useCallback, useEffect, useRef } from "react";
import { Obstacle, Projectile } from "@/types/gameTypes";
import { useObstacles } from "./useObstacles";
import { useProjectiles } from "./useProjectiles";
import { useCollisions } from "./useCollisions";
import { useSound } from "./useSound";
import { usePowerUps } from "./usePowerUps";
import { HighScoreService } from "@/services/HighScoreService";
import { AchievementService } from "@/services/AchievementService";
import { StatisticsService } from "@/services/StatisticsService";
import { getLevelByScore, LEVELS } from "@/config/levels";
import { POWER_UP_CONFIGS } from "@/config/powerUps";
import { PowerUpType } from "@/types/powerUpTypes";
import { GameStats } from "@/types/achievementTypes";

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
  const [playerName, setPlayerName] = useState<string>(localStorage.getItem('playerName') || "");
  const [showNameDialog, setShowNameDialog] = useState(playerName === "");
  
  // New state for features
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelUpNotification, setLevelUpNotification] = useState<{ level: number; name: string } | null>(null);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [consecutiveHits, setConsecutiveHits] = useState(0);
  const [timeWithoutHit, setTimeWithoutHit] = useState(0);
  const [powerUpsCollected, setPowerUpsCollected] = useState(0);
  const [achievementNotifications, setAchievementNotifications] = useState<any[]>([]);
  const gameStartTimeRef = useRef<number>(Date.now());
  const lastHitTimeRef = useRef<number>(Date.now());
  
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
  }, [score, speed, scoreMultiplier, meteorHits, lives, gameOver]);

  const { createObstacle, updateObstacles, resetObstacleTimer } = useObstacles(scoreRef, speedRef);
  const { createProjectile, updateProjectiles, resetProjectileTimer } = useProjectiles();
  const { checkShipCollision, checkProjectileCollisions } = useCollisions();

  // Handle score submission
  const submitHighScore = useCallback(async () => {
    if (!gameOver || !playerName || score <= 0) return;
    
    try {
      console.log("Score submitted for:", playerName);
      
      // Calculate survival time
      const survivalSeconds = Math.floor(survivalTime);
      
      // Submit to leaderboards
      await HighScoreService.addLeaderboardEntry(
        playerName,
        score,
        meteorHits,
        currentLevel,
        survivalSeconds
      );
      
      // Update statistics
      StatisticsService.updateStatistics({
        score,
        meteorsHit: meteorHits,
        survivalTime: survivalSeconds,
        powerUpsCollected,
        highestLevel: currentLevel
      });
      
      // Check and unlock achievements
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
      
      // Show achievement notifications
      if (unlockedAchievements.length > 0) {
        unlockedAchievements.forEach((achievement, index) => {
          setTimeout(() => {
            playSound('achievementUnlock');
            setAchievementNotifications(prev => [...prev, achievement]);
            // Remove notification after 5 seconds
            setTimeout(() => {
              setAchievementNotifications(prev => prev.filter(a => a.id !== achievement.id));
            }, 5000);
          }, index * 500);
        });
      }
    } catch (error) {
      console.error("Failed to submit high score:", error);
    }
  }, [gameOver, playerName, score, meteorHits, currentLevel, survivalTime, powerUpsCollected, lives, consecutiveHits, timeWithoutHit, playSound]);

  // Handle ship being hit
  const handleShipHit = useCallback(() => {
    if (isInvulnerable || gameOverRef.current) return;
    
    setLives(prev => prev - 1);
    if (livesRef.current - 1 <= 0) {
      // Game over when no lives left
      setGameOver(true);
      gameOverRef.current = true;
      playSound('crash');
      // Submit high score when game is over
      if (playerName) {
        setTimeout(() => submitHighScore(), 1000);
      } else {
        setShowNameDialog(true);
      }
    } else {
      // Set temporary invulnerability
      setIsInvulnerable(true);
      playSound('crash');
      
      // Reset invulnerability after 2 seconds
      setTimeout(() => {
        setIsInvulnerable(false);
      }, 2000);
    }
  }, [isInvulnerable, playSound, playerName, submitHighScore]);

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
    
    if (!playerName) {
      setShowNameDialog(true);
    }
  }, [resetObstacleTimer, resetProjectileTimer, resetPowerUps, playSound, playerName]);

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
    
    // Check for level progression every 60 frames
    if (Math.floor(scoreRef.current / 10) % 60 === 0) {
      const newLevel = getLevelByScore(scoreRef.current);
      if (newLevel.level > currentLevel) {
        setCurrentLevel(newLevel.level);
        setLevelUpNotification({ level: newLevel.level, name: newLevel.name });
        playSound('levelUp');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setLevelUpNotification(null);
        }, 3000);
        
        // Apply level speed and frequency multipliers
        setSpeed(prev => prev * newLevel.speedMultiplier);
      }
    }
    
    // Spawn power-ups
    spawnPowerUp();
    updatePowerUps();
    
    // Check for power-up collisions
    powerUps.forEach(powerUp => {
      const powerUpX = powerUp.x;
      const powerUpY = powerUp.y;
      const shipX = shipPosition;
      
      // Simple collision detection
      const distanceX = Math.abs(powerUpX - shipX);
      const distanceY = Math.abs(powerUpY - 90); // Ship is at bottom
      
      if (distanceX < 5 && distanceY < 10) {
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
          // Other power-ups
          activatePowerUp(powerUp.type, config.duration);
        }
      }
    });
    
    if (scoreRef.current > 0 && scoreRef.current % 500 === 0) {
      setSpeed(prev => Math.min(prev + 0.1, 3.0));
      playSound('speedUp');
    }
    
    // Apply slow motion power-up to obstacle speed
    const slowMotion = isPowerUpActive(PowerUpType.SLOW_MOTION) ? 0.5 : 1.0;
    
    const newObstacle = createObstacle();
    if (newObstacle) {
      setObstacles(prev => [...prev, newObstacle]);
    }
    
    setObstacles(prev => {
      const updated = updateObstacles(prev, slowMotion);
      return updated;
    });
    
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
      setScore(prev => prev + Math.round(50 * scoreMultiplierRef.current * scoreBoost));
      setObstacles(collidedObstacles);
      setProjectiles(newProjectilesList);
    }
    
    const shipCollided = checkShipCollision(obstacles, shipPosition, gameOverRef.current);
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

  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    setShowNameDialog(false);
    
    // If game is over, submit the score now that we have a name
    if (gameOverRef.current && score > 0) {
      setTimeout(() => submitHighScore(), 500);
    }
  }, [score, submitHighScore]);

  useEffect(() => {
    startGame();
    playSound('atmosphere');
    
    // Check if we need to show the name dialog
    if (!playerName) {
      setShowNameDialog(true);
    }
  }, [startGame, playSound, playerName]);

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
    playerName,
    showNameDialog,
    currentLevel,
    levelUpNotification,
    powerUps,
    activePowerUps,
    achievementNotifications,
    survivalTime,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame,
    handleNameSubmit
  };
};

export default useGameState;
