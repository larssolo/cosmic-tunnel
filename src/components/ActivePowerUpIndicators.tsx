import { useEffect, useState } from "react";
import { ActivePowerUp } from "@/types/powerUpTypes";
import { POWER_UP_CONFIGS } from "@/config/powerUps";
import { Shield, Zap, Timer, Star } from "lucide-react";

interface ActivePowerUpIndicatorsProps {
  activePowerUps: ActivePowerUp[];
}

const iconMap = {
  Shield,
  Zap,
  Timer,
  Star
};

export const ActivePowerUpIndicators = ({ activePowerUps }: ActivePowerUpIndicatorsProps) => {
  const [, setTick] = useState(0);

  // Force re-render every 100ms to update timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (activePowerUps.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 flex flex-col gap-2 z-40">
      {activePowerUps.map((powerUp) => {
        const config = POWER_UP_CONFIGS[powerUp.type];
        const IconComponent = iconMap[config.icon as keyof typeof iconMap];
        const timeLeft = Math.max(0, (powerUp.expiresAt - Date.now()) / 1000);
        const percentage = (timeLeft / (config.duration / 1000)) * 100;

        if (!IconComponent) return null;

        return (
          <div
            key={powerUp.type}
            className="relative bg-background/80 backdrop-blur-sm rounded-lg p-2 border border-border/50"
            style={{
              boxShadow: `0 0 10px ${config.color}44`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded animate-pulse"
                style={{ backgroundColor: `${config.color}33` }}
              >
                <IconComponent size={20} style={{ color: config.color }} />
              </div>
              <div className="flex flex-col min-w-16">
                <span className="text-xs font-semibold text-foreground">
                  {config.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeLeft.toFixed(1)}s
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-muted rounded-b-lg overflow-hidden">
              <div
                className="h-full transition-all duration-100"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: config.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
