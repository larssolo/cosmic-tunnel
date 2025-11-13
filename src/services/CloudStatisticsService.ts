import { supabase } from "@/integrations/supabase/client";

export interface CloudStatistics {
  total_games: number;
  total_score: number;
  total_meteors: number;
  total_survival_time: number;
  highest_level: number;
}

export const CloudStatisticsService = {
  async updateStatistics(
    score: number,
    meteors: number,
    survivalTime: number,
    level: number
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Get current statistics
      const { data: currentStats, error: fetchError } = await supabase
        .from("statistics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching statistics:", fetchError);
        return false;
      }

      const newStats = {
        user_id: user.id,
        total_games: (currentStats?.total_games || 0) + 1,
        total_score: (currentStats?.total_score || 0) + score,
        total_meteors: (currentStats?.total_meteors || 0) + meteors,
        total_survival_time: (currentStats?.total_survival_time || 0) + survivalTime,
        highest_level: Math.max(currentStats?.highest_level || 0, level),
      };

      const { error } = await supabase
        .from("statistics")
        .upsert(newStats, { onConflict: "user_id" });

      if (error) {
        console.error("Error updating statistics:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating statistics:", error);
      return false;
    }
  },

  async getStatistics(): Promise<CloudStatistics | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("statistics")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching statistics:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return null;
    }
  },
};
