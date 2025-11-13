import { PowerUp } from "@/types/powerUpTypes";
import { POWER_UP_CONFIGS } from "@/config/powerUps";
import { Shield, Zap, Timer, Star, Heart } from "lucide-react";

interface PowerUpsProps {
  powerUps: PowerUp[];
}

const iconMap = {
  Shield,
  Zap,
  Timer,
  Star,
  Heart
};

export const PowerUps = ({ powerUps }: PowerUpsProps) => {
  return (
    <>
      {powerUps.map((powerUp) => {
        const config = POWER_UP_CONFIGS[powerUp.type];
        const IconComponent = iconMap[config.icon as keyof typeof iconMap];

        return (
          <div
            key={powerUp.id}
            className="absolute transition-all duration-100 animate-pulse"
            style={{
              left: `${powerUp.x}%`,
              top: `${powerUp.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="rounded-full p-3 backdrop-blur-sm shadow-lg animate-spin"
              style={{
                backgroundColor: `${config.color}33`,
                boxShadow: `0 0 20px ${config.color}`,
              }}
            >
              <IconComponent
                size={24}
                style={{ color: config.color }}
                strokeWidth={3}
              />
            </div>
          </div>
        );
      })}
    </>
  );
};
