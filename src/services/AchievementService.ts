import { Achievement } from "@/types/achievementTypes";
import { GameStats } from "@/types/achievementTypes";
import { ACHIEVEMENTS } from "@/config/achievements";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "space_shooter_achievements";

export const AchievementService = {
  // Get all achievements from localStorage
  getAchievements(): Achievement[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Initialize with default achievements
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ACHIEVEMENTS));
        return [...ACHIEVEMENTS];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      return [...ACHIEVEMENTS];
    }
  },

  // Save achievements to localStorage
  saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    } catch (error) {
      console.error("Error saving achievements:", error);
    }
  },

  // Check and unlock achievements based on game stats
  checkAchievements(gameStats: GameStats): Achievement[] {
    const achievements = this.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    achievements.forEach((achievement) => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;
      let newProgress = achievement.progress;

      switch (achievement.condition) {
        case "totalScore":
          newProgress = gameStats.score;
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "meteorsHit":
          newProgress = gameStats.meteorsHit;
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "gamesPlayed":
          newProgress += 1;
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "perfectGame":
          if (gameStats.perfectGame && gameStats.score >= 5000) {
            shouldUnlock = true;
            newProgress = 1;
          }
          break;
        case "speedDemon":
          newProgress = gameStats.highestLevel;
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "survivor":
          newProgress = Math.max(newProgress, gameStats.survivalTime);
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "powerUpCollector":
          newProgress = gameStats.powerUpsCollected;
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "untouchable":
          newProgress = Math.max(newProgress, gameStats.timeWithoutHit);
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "sharpshooter":
          newProgress = Math.max(newProgress, gameStats.consecutiveHits);
          shouldUnlock = newProgress >= achievement.target;
          break;
        case "marathonRunner":
          newProgress += 1;
          shouldUnlock = newProgress >= achievement.target;
          break;
      }

      achievement.progress = newProgress;

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        newlyUnlocked.push(achievement);
      }
    });

    this.saveAchievements(achievements);
    return newlyUnlocked;
  },

  // Manually unlock an achievement (for testing or special events)
  unlockAchievement(id: string): boolean {
    const achievements = this.getAchievements();
    const achievement = achievements.find((a) => a.id === id);

    if (!achievement || achievement.unlocked) return false;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    achievement.progress = achievement.target;

    this.saveAchievements(achievements);

    toast({
      title: "Achievement Unlocked!",
      description: `${achievement.name}: ${achievement.description}`,
    });

    return true;
  },

  // Get achievement completion percentage
  getCompletionPercentage(): number {
    const achievements = this.getAchievements();
    const unlocked = achievements.filter((a) => a.unlocked).length;
    return Math.round((unlocked / achievements.length) * 100);
  },

  // Reset all achievements (for settings)
  resetAchievements(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ACHIEVEMENTS));
  }
};
