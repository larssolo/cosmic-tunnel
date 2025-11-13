import { useEffect, useState } from "react";

interface LevelUpNotificationProps {
  level: number;
  name: string;
}

export const LevelUpNotification = ({ level, name }: LevelUpNotificationProps) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div className="animate-scale-in">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-1 rounded-lg">
          <div className="bg-background/95 backdrop-blur-sm p-8 rounded-lg">
            <h2 className="text-5xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              LEVEL {level}
            </h2>
            <p className="text-2xl text-center text-foreground/80">
              {name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
