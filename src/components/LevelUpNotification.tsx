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
      <div style={{ textAlign: "center", fontFamily: "'Press Start 2P', monospace", animation: "lvlFadeInOut 3s ease forwards" }}>
        <p style={{ color: "#ff00ff", fontSize: "clamp(10px, 2vw, 18px)", textShadow: "2px 2px 0 #00ffff, 4px 4px 0 #000, 0 0 14px #ff00ff", letterSpacing: "0.05em" }}>
          LEVEL {level}
        </p>
        <p style={{ color: "#00ffff", fontSize: "clamp(7px, 1.2vw, 11px)", marginTop: "0.4em", textShadow: "1px 1px 0 #ff00ff, 0 0 8px #00ffff", letterSpacing: "0.04em" }}>
          {name}
        </p>
      </div>
      <style>{`
        @keyframes lvlFadeInOut {
          0%   { opacity: 0; transform: scale(0.85); }
          12%  { opacity: 1; transform: scale(1); }
          75%  { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
