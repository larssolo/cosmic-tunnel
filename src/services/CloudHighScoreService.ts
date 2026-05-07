import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  level: number;
  meteors_destroyed: number;
  survival_time: number;
  created_at: string;
}

export const CloudHighScoreService = {
  async saveHighScore(
    playerName: string,
    score: number,
    level: number,
    meteorsDestroyed: number,
    survivalTime: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("leaderboard")
        .insert({
          player_name: playerName,
          score,
          level,
          meteors_destroyed: meteorsDestroyed,
          survival_time: survivalTime,
        });

      if (error) {
        console.error("Error saving high score:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getHighScores(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching high scores:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  },

  async getRankAndTotal(score: number): Promise<{ rank: number; total: number }> {
    try {
      const [higherRes, totalRes] = await Promise.all([
        supabase
          .from("leaderboard")
          .select("*", { count: "exact", head: true })
          .gt("score", score),
        supabase
          .from("leaderboard")
          .select("*", { count: "exact", head: true }),
      ]);

      const higher = higherRes.count ?? 0;
      const total = totalRes.count ?? 0;
      return { rank: higher + 1, total };
    } catch {
      return { rank: 0, total: 0 };
    }
  },
};
