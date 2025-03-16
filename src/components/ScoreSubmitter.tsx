
import React, { useEffect } from "react";
import { HighScoreService } from "@/services/HighScoreService";
import { useToast } from "@/components/ui/use-toast";

interface ScoreSubmitterProps {
  gameOver: boolean;
  explosionComplete: boolean;
  playerName: string;
  score: number;
  scoreSubmitted: boolean;
  gamesPlayed: number;
  onScoreSubmitted: () => void;
  onGamesPlayedIncremented: () => void;
  onResetForNewPilot: () => void;
}

const ScoreSubmitter: React.FC<ScoreSubmitterProps> = ({
  gameOver,
  explosionComplete,
  playerName,
  score,
  scoreSubmitted,
  gamesPlayed,
  onScoreSubmitted,
  onGamesPlayedIncremented,
  onResetForNewPilot
}) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (gameOver && explosionComplete && playerName && !scoreSubmitted && score > 0) {
      const submitScore = async () => {
        try {
          await HighScoreService.addScore(playerName, score);
          onScoreSubmitted();
          console.log("Score submitted for:", playerName);
          
          // Increment games played count
          onGamesPlayedIncremented();
          
          // Check if player needs to re-enter name (after 3 games)
          if (gamesPlayed >= 2) { // 2 + current game = 3 total
            // Show toast notification
            toast({
              title: "Pilot Change Required",
              description: "After 3 missions, please register a new pilot name",
              duration: 5000,
            });
            
            // Reset games played counter and prompt for new name after restart
            setTimeout(() => {
              onResetForNewPilot();
            }, 1000);
          }
        } catch (error) {
          console.error("Failed to submit score:", error);
        }
      };
      
      submitScore();
    }
  }, [
    gameOver, 
    explosionComplete, 
    playerName, 
    score, 
    scoreSubmitted, 
    gamesPlayed, 
    toast,
    onScoreSubmitted,
    onGamesPlayedIncremented,
    onResetForNewPilot
  ]);

  // This component doesn't render anything visible
  return null;
};

export default ScoreSubmitter;
