import { supabase } from "@/integrations/supabase/client";
import { Achievement } from "@/types/achievementTypes";

export const CloudAchievementService = {
  async unlockAchievement(achievementId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      const { error } = await supabase
        .from("achievements")
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (error) {
        // If already unlocked, ignore the error
        if (error.code === "23505") {
          return true;
        }
        console.error("Error unlocking achievement:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      return false;
    }
  },

  async getUnlockedAchievements(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching achievements:", error);
        return [];
      }

      return (data || []).map((item) => item.achievement_id);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [];
    }
  },

  async isAchievementUnlocked(achievementId: string): Promise<boolean> {
    const unlocked = await this.getUnlockedAchievements();
    return unlocked.includes(achievementId);
  },
};
