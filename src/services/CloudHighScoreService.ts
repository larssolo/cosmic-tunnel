import { supabase } from "@/integrations/supabase/client";

export interface CloudHighScore {
  id: string;
  user_id: string;
  score: number;
  level: number;
  meteors_destroyed: number;
  survival_time: number;
  created_at: string;
  player_name?: string;
}

export const CloudHighScoreService = {
  async saveHighScore(
    score: number,
    level: number,
    meteorsDestroyed: number,
    survivalTime: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "Not authenticated" };
      }

      const { error } = await supabase
        .from("high_scores")
        .insert({
          user_id: user.id,
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
      console.error("Error saving high score:", error);
      return { success: false, error: error.message };
    }
  },

  async getHighScores(limit: number = 10): Promise<CloudHighScore[]> {
    try {
      const { data, error } = await supabase
        .from("high_scores")
        .select(`
          *,
          profiles!inner(player_name)
        `)
        .order("score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching high scores:", error);
        return [];
      }

      return (data || []).map((item: any) => ({
        ...item,
        player_name: item.profiles?.player_name || "Unknown",
      }));
    } catch (error) {
      console.error("Error fetching high scores:", error);
      return [];
    }
  },

  async getUserHighScores(userId: string, limit: number = 5): Promise<CloudHighScore[]> {
    try {
      const { data, error } = await supabase
        .from("high_scores")
        .select("*")
        .eq("user_id", userId)
        .order("score", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching user high scores:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching user high scores:", error);
      return [];
    }
  },
};
