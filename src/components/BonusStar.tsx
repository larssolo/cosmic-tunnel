import React, { memo } from "react";
import { BonusStar as BonusStarType } from "@/types/gameTypes";

const BonusStar: React.FC<{ star: BonusStarType | null }> = memo(({ star }) => {
  if (!star) return null;
  const hpPct = (star.hp / star.maxHp) * 100;

  return (
    <div
      className="absolute"
      style={{
        width: "5%",
        aspectRatio: "1 / 1",
        left: `${star.x}%`,
        top: `${star.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 6,
        animation: "bonusStarPulse 0.7s ease-in-out infinite alternate",
      }}
    >
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, #ffff00 0%, #ffaa00 40%, transparent 70%)",
          boxShadow: "0 0 30px #ffff00, 0 0 60px #ffaa00",
          opacity: 0.7,
        }}
      />
      {/* 5-pointed star */}
      <div
        className="absolute inset-[15%]"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #ffff00 40%, #ff8800 100%)",
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          boxShadow: "0 0 20px #ffff00",
        }}
      />
      {/* Tiny HP indicator */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-1 bg-black/70"
        style={{ width: "120%", boxShadow: "0 0 6px #ffff00" }}
      >
        <div
          className="h-full"
          style={{
            width: `${hpPct}%`,
            background: "linear-gradient(to right, #ff8800, #ffff00)",
            boxShadow: "0 0 6px #ffff00",
          }}
        />
      </div>
      <style>{`
        @keyframes bonusStarPulse {
          from { transform: translate(-50%, -50%) scale(0.85) rotate(-8deg); }
          to   { transform: translate(-50%, -50%) scale(1.15) rotate(8deg); }
        }
      `}</style>
    </div>
  );
});

BonusStar.displayName = "BonusStar";
export default BonusStar;
