import { Achievement, AchievementCondition } from "@/types/achievementTypes";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_flight",
    name: "First Flight",
    description: "Play your first game",
    icon: "Rocket",
    condition: AchievementCondition.GAMES_PLAYED,
    unlocked: false,
    progress: 0,
    target: 1
  },
  {
    id: "meteor_hunter_1",
    name: "Meteor Hunter I",
    description: "Destroy 10 meteors",
    icon: "Target",
    condition: AchievementCondition.METEORS_HIT,
    unlocked: false,
    progress: 0,
    target: 10
  },
  {
    id: "meteor_hunter_2",
    name: "Meteor Hunter II",
    description: "Destroy 50 meteors",
    icon: "Target",
    condition: AchievementCondition.METEORS_HIT,
    unlocked: false,
    progress: 0,
    target: 50
  },
  {
    id: "meteor_hunter_3",
    name: "Meteor Hunter III",
    description: "Destroy 100 meteors",
    icon: "Target",
    condition: AchievementCondition.METEORS_HIT,
    unlocked: false,
    progress: 0,
    target: 100
  },
  {
    id: "survivor",
    name: "Survivor",
    description: "Survive for 60 seconds in one game",
    icon: "Shield",
    condition: AchievementCondition.SURVIVOR,
    unlocked: false,
    progress: 0,
    target: 60
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Reach level 5",
    icon: "Zap",
    condition: AchievementCondition.SPEED_DEMON,
    unlocked: false,
    progress: 0,
    target: 5
  },
  {
    id: "perfect_pilot",
    name: "Perfect Pilot",
    description: "Score 5000+ without losing a life",
    icon: "Award",
    condition: AchievementCondition.PERFECT_GAME,
    unlocked: false,
    progress: 0,
    target: 1
  },
  {
    id: "power_user",
    name: "Power User",
    description: "Collect 20 power-ups",
    icon: "Star",
    condition: AchievementCondition.POWER_UP_COLLECTOR,
    unlocked: false,
    progress: 0,
    target: 20
  },
  {
    id: "untouchable",
    name: "Untouchable",
    description: "Survive 30 seconds without taking damage",
    icon: "CircleDot",
    condition: AchievementCondition.UNTOUCHABLE,
    unlocked: false,
    progress: 0,
    target: 30
  },
  {
    id: "sharpshooter",
    name: "Sharpshooter",
    description: "Hit 5 meteors in a row",
    icon: "Crosshair",
    condition: AchievementCondition.SHARPSHOOTER,
    unlocked: false,
    progress: 0,
    target: 5
  },
  {
    id: "marathon_runner",
    name: "Marathon Runner",
    description: "Play 50 games",
    icon: "Trophy",
    condition: AchievementCondition.MARATHON_RUNNER,
    unlocked: false,
    progress: 0,
    target: 50
  },
  {
    id: "score_master_1",
    name: "Score Master I",
    description: "Reach a total score of 10,000",
    icon: "TrendingUp",
    condition: AchievementCondition.TOTAL_SCORE,
    unlocked: false,
    progress: 0,
    target: 10000
  },
  {
    id: "score_master_2",
    name: "Score Master II",
    description: "Reach a total score of 50,000",
    icon: "TrendingUp",
    condition: AchievementCondition.TOTAL_SCORE,
    unlocked: false,
    progress: 0,
    target: 50000
  },
  {
    id: "score_master_3",
    name: "Score Master III",
    description: "Reach a total score of 100,000",
    icon: "TrendingUp",
    condition: AchievementCondition.TOTAL_SCORE,
    unlocked: false,
    progress: 0,
    target: 100000
  },
  {
    id: "ultimate_pilot",
    name: "Ultimate Pilot",
    description: "Reach level 10",
    icon: "Crown",
    condition: AchievementCondition.SPEED_DEMON,
    unlocked: false,
    progress: 0,
    target: 10
  }
];
