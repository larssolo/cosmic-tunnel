
import { HighScore, LeaderboardEntry, LeaderboardType } from "@/types/gameTypes";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = "space_shooter_high_scores";
const LEADERBOARD_KEY_PREFIX = "space_shooter_leaderboard_";

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
  },

  // Add a leaderboard entry with full stats
  async addLeaderboardEntry(
    playerName: string,
    score: number,
    meteorsHit: number,
    highestLevel: number,
    survivalTime: number
  ): Promise<boolean> {
    try {
      const date = new Date().toISOString().split('T')[0];
      const newEntry: LeaderboardEntry = {
        id: uuidv4(),
        playerName,
        score,
        meteorsHit,
        highestLevel,
        survivalTime,
        date
      };

      // Update each leaderboard type
      const leaderboardTypes = [
        LeaderboardType.HIGH_SCORE,
        LeaderboardType.METEORS,
        LeaderboardType.SURVIVAL,
        LeaderboardType.LEVEL
      ];

      for (const type of leaderboardTypes) {
        const key = `${LEADERBOARD_KEY_PREFIX}${type}`;
        const stored = localStorage.getItem(key);
        const entries: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];

        entries.push(newEntry);

        // Sort based on type
        let sorted: LeaderboardEntry[];
        switch (type) {
          case LeaderboardType.HIGH_SCORE:
            sorted = entries.sort((a, b) => b.score - a.score);
            break;
          case LeaderboardType.METEORS:
            sorted = entries.sort((a, b) => b.meteorsHit - a.meteorsHit);
            break;
          case LeaderboardType.SURVIVAL:
            sorted = entries.sort((a, b) => b.survivalTime - a.survivalTime);
            break;
          case LeaderboardType.LEVEL:
            sorted = entries.sort((a, b) => b.highestLevel - a.highestLevel);
            break;
          default:
            sorted = entries;
        }

        // Keep only top 10
        const top10 = sorted.slice(0, 10);
        localStorage.setItem(key, JSON.stringify(top10));
      }

      return true;
    } catch (error) {
      console.error('Error adding leaderboard entry:', error);
      return false;
    }
  },

  // Get leaderboard by type
  async getLeaderboard(type: LeaderboardType, limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const key = `${LEADERBOARD_KEY_PREFIX}${type}`;
      const stored = localStorage.getItem(key);
      const entries: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
      return entries.slice(0, limit);
    } catch (error) {
      console.error(`Error fetching ${type} leaderboard:`, error);
      return [];
    }
  }
};
