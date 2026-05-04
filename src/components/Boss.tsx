import React, { memo } from "react";
import { Boss as BossType } from "@/types/gameTypes";

interface BossProps {
  boss: BossType | null;
}

const Boss: React.FC<BossProps> = memo(({ boss }) => {
  if (!boss) return null;

  const hpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);

  return (
    <div
      className="absolute"
      style={{
        width: `${boss.size}%`,
        aspectRatio: "1 / 1",
        left: `${boss.x}%`,
        top: `${boss.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 5,
      }}
    >
      {/* Health bar */}
      {!boss.isExploding && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-[120%] h-2 bg-black border border-red-500"
          style={{ boxShadow: "0 0 8px #ff0000" }}
        >
          <div
            className="h-full transition-all"
            style={{
              width: `${hpPct}%`,
              background: hpPct > 50 ? "#00ff00" : hpPct > 25 ? "#ffff00" : "#ff0000",
              boxShadow: `0 0 8px ${hpPct > 50 ? "#00ff00" : hpPct > 25 ? "#ffff00" : "#ff0000"}`,
            }}
          />
        </div>
      )}

      {!boss.isExploding ? (
        <div className="w-full h-full relative animate-pulse">
          {/* Outer menacing ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, #ff0066 0%, #660033 70%, #1a0010 100%)",
              boxShadow: "0 0 40px #ff0066, inset 0 0 30px #ff00aa",
            }}
          />
          {/* Spikes */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = i * 45;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: "8%",
                  height: "55%",
                  background: "linear-gradient(to top, #ff0066, transparent)",
                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                  transformOrigin: "50% 100%",
                  opacity: 0.7,
                }}
              />
            );
          })}
          {/* Eye / core */}
          <div
            className="absolute inset-[30%] rounded-full"
            style={{
              background: "radial-gradient(circle, #ffff00 0%, #ff6600 50%, #990000 100%)",
              boxShadow: "0 0 20px #ffff00",
            }}
          />
          <div
            className="absolute inset-[42%] rounded-full bg-black"
            style={{ boxShadow: "inset 0 0 8px #ff0000" }}
          />
        </div>
      ) : (
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 rounded-full bg-yellow-300 animate-ping"
            style={{ boxShadow: "0 0 80px #ffff00" }}
          />
          <div className="absolute inset-1/4 rounded-full bg-orange-500 animate-pulse" />
          <div className="absolute inset-2/5 rounded-full bg-white" />
        </div>
      )}
    </div>
  );
});

Boss.displayName = "Boss";
export default Boss;
