
import { HighScore } from "@/types/gameTypes";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "space_shooter_high_scores";

export const HighScoreService = {
  // Get top 5 high scores
  async getTopScores(): Promise<HighScore[]> {
    try {
      const scoresJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      const scores: HighScore[] = scoresJson ? JSON.parse(scoresJson) : [];
      
      // Sort by score (highest first) and return top 10
      return scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      return [];
    }
  },
  
  // Add a new high score
  async addScore(playerName: string, score: number): Promise<boolean> {
    try {
      const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const newScore: HighScore = {
        id: uuidv4(),
        playerName,
        score,
        date
      };
      
      // Get current scores
      const scoresJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      const currentScores: HighScore[] = scoresJson ? JSON.parse(scoresJson) : [];
      
      // Add new score
      const updatedScores = [...currentScores, newScore];
      
      // Sort by score (highest first) and keep only top 10
      const top10Scores = updatedScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      // Save updated scores (only top 10)
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(top10Scores));
      
      toast({
        title: "High Score Saved!",
        description: `${playerName}: ${score} points`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding high score:', error);
      toast({
        variant: "destructive",
        title: "Error Saving Score",
        description: "Could not save your high score.",
      });
      return false;
    }
  }
};
