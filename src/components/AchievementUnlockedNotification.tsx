import { useEffect, useState } from "react";
import { Achievement } from "@/types/achievementTypes";
import { Trophy } from "lucide-react";

interface AchievementUnlockedNotificationProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export const AchievementUnlockedNotification = ({
  achievement,
  onDismiss,
}: AchievementUnlockedNotificationProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setVisible(true), 100);

    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`z-50 mr-4 transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 p-1 rounded-lg shadow-2xl">
        <div className="bg-background/95 backdrop-blur-sm p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full animate-pulse">
              <Trophy size={24} className="text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-yellow-500 mb-1">
                Achievement Unlocked!
              </h3>
              <p className="text-base font-semibold text-foreground mb-1">
                {achievement.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
