const STORAGE_KEY = "space_shooter_statistics";

export interface Statistics {
  totalGamesPlayed: number;
  totalScore: number;
  totalMeteorsHit: number;
  totalSurvivalTime: number;
  totalPowerUpsCollected: number;
  bestScore: number;
  longestSurvivalTime: number;
  mostMeteorsInOneGame: number;
  highestLevelReached: number;
}

const DEFAULT_STATS: Statistics = {
  totalGamesPlayed: 0,
  totalScore: 0,
  totalMeteorsHit: 0,
  totalSurvivalTime: 0,
  totalPowerUpsCollected: 0,
  bestScore: 0,
  longestSurvivalTime: 0,
  mostMeteorsInOneGame: 0,
  highestLevelReached: 1
};

export const StatisticsService = {
  // Get current statistics
  getStatistics(): Statistics {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
        return { ...DEFAULT_STATS };
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return { ...DEFAULT_STATS };
    }
  },

  // Update statistics after a game
  updateStatistics(gameData: {
    score: number;
    meteorsHit: number;
    survivalTime: number;
    powerUpsCollected: number;
    highestLevel: number;
  }): void {
    const stats = this.getStatistics();

    stats.totalGamesPlayed += 1;
    stats.totalScore += gameData.score;
    stats.totalMeteorsHit += gameData.meteorsHit;
    stats.totalSurvivalTime += gameData.survivalTime;
    stats.totalPowerUpsCollected += gameData.powerUpsCollected;

    if (gameData.score > stats.bestScore) {
      stats.bestScore = gameData.score;
    }

    if (gameData.survivalTime > stats.longestSurvivalTime) {
      stats.longestSurvivalTime = gameData.survivalTime;
    }

    if (gameData.meteorsHit > stats.mostMeteorsInOneGame) {
      stats.mostMeteorsInOneGame = gameData.meteorsHit;
    }

    if (gameData.highestLevel > stats.highestLevelReached) {
      stats.highestLevelReached = gameData.highestLevel;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error("Error saving statistics:", error);
    }
  },

  // Reset all statistics
  resetStatistics(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
  }
};
