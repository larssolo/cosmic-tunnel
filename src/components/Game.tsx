
import React, { useRef, useState, useEffect, useCallback } from "react";
import Tunnel from "./Tunnel";
import Spaceship from "./Spaceship";
import Obstacles from "./Obstacles";
import Projectiles from "./Projectiles";
import GameUI from "./GameUI";
import PlayerNameDialog from "./PlayerNameDialog";
import GameController from "./GameController";
import MobileControls from "./MobileControls";
import ScoreSubmitter from "./ScoreSubmitter";
import ExplosionHandler from "./ExplosionHandler";
import useGameState from "@/hooks/useGameState";

const Game = () => {
  // Game container reference
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // Add state to track if the explosion animation is complete
  const [explosionComplete, setExplosionComplete] = useState(false);
  
  // Add state for mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  // Add state for player name and game tracking
  const [playerName, setPlayerName] = useState<string>("");
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const { 
    score,
    gameOver,
    shipPosition,
    obstacles,
    projectiles,
    scoreMultiplier,
    meteorHits,
    lives,
    isInvulnerable,
    startGame,
    resetGame,
    moveShip,
    shootProjectile,
    updateGame
  } = useGameState();

  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    
    setIsMobile(checkMobile());
    
    // Try to get previously saved player name
    const savedName = localStorage.getItem("pilotName");
    if (savedName) {
      setPlayerName(savedName);
      setShowNameDialog(false);
    }
  }, []);
  
  // Handle game restart
  const handleRestart = useCallback(() => {
    resetGame();
    setExplosionComplete(false);
    setScoreSubmitted(false);
    
    // Check if player needs to re-enter name
    if (gamesPlayed >= 2) {
      setShowNameDialog(true);
    }
  }, [resetGame, gamesPlayed]);
  
  // Handle player name submission
  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name);
    localStorage.setItem("pilotName", name);
    setShowNameDialog(false);
  }, []);

  // Handle explosion completion
  const handleExplosionComplete = useCallback(() => {
    setExplosionComplete(true);
  }, []);

  // Handle score submission
  const handleScoreSubmitted = useCallback(() => {
    setScoreSubmitted(true);
  }, []);

  // Handle games played increment
  const handleGamesPlayedIncremented = useCallback(() => {
    setGamesPlayed(prev => prev + 1);
  }, []);

  // Handle reset for new pilot
  const handleResetForNewPilot = useCallback(() => {
    setGamesPlayed(0);
    localStorage.removeItem("pilotName");
  }, []);

  // Reset explosion state when game restarts
  useEffect(() => {
    if (!gameOver) {
      setExplosionComplete(false);
      setScoreSubmitted(false);
    }
  }, [gameOver]);

  return (
    <div className="relative w-full h-full">
      {/* Hidden controller components */}
      <GameController
        playerName={playerName}
        isMobile={isMobile}
        gameOver={gameOver}
        onMove={moveShip}
        onShoot={shootProjectile}
        onUpdateGame={updateGame}
      />
      
      <MobileControls
        isMobile={isMobile}
        gameOver={gameOver}
        onMove={moveShip}
      />
      
      <ScoreSubmitter
        gameOver={gameOver}
        explosionComplete={explosionComplete}
        playerName={playerName}
        score={score}
        scoreSubmitted={scoreSubmitted}
        gamesPlayed={gamesPlayed}
        onScoreSubmitted={handleScoreSubmitted}
        onGamesPlayedIncremented={handleGamesPlayedIncremented}
        onResetForNewPilot={handleResetForNewPilot}
      />
      
      <ExplosionHandler
        gameOver={gameOver}
        explosionComplete={explosionComplete}
        onExplosionComplete={handleExplosionComplete}
      />
      
      {/* Game area */}
      <div className="w-full h-full relative overflow-hidden touch-none"
           ref={gameContainerRef}
           onClick={shootProjectile}>
        <Tunnel />
        <Spaceship 
          position={shipPosition} 
          onShoot={shootProjectile} 
          isExploding={gameOver}
          isInvulnerable={isInvulnerable}
        />
        <Obstacles obstacles={obstacles} />
        <Projectiles projectiles={projectiles} />
        <GameUI 
          score={score} 
          gameOver={gameOver && explosionComplete} 
          onRestart={handleRestart} 
          scoreMultiplier={scoreMultiplier}
          meteorHits={meteorHits}
          lives={lives}
          isInvulnerable={isInvulnerable}
          playerName={playerName}
        />
      </div>
      
      {/* Player name dialog */}
      <PlayerNameDialog 
        open={showNameDialog} 
        onSubmit={handleNameSubmit} 
      />
    </div>
  );
};

export default Game;
