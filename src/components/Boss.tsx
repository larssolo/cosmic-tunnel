import React, { memo } from "react";
import { Boss as BossType, BossLaser } from "@/types/gameTypes";

interface BossProps {
  boss: BossType | null;
  lasers?: BossLaser[];
}

const Boss: React.FC<BossProps> = memo(({ boss, lasers = [] }) => {
  if (!boss) return null;

  const hpPct = Math.max(0, (boss.hp / boss.maxHp) * 100);

  return (
    <>
      {/* Boss laser beams (only used by laser_beast) */}
      {lasers.map((l) => {
        const elapsed = Date.now() - l.startedAt;
        const charging = elapsed < 600;
        const firing = elapsed >= 600 && elapsed < l.duration;
        if (!charging && !firing) return null;
        return (
          <div
            key={l.id}
            className="absolute pointer-events-none"
            style={{
              left: `${l.x}%`,
              top: 0,
              bottom: 0,
              width: charging ? "2px" : "10px",
              transform: "translateX(-50%)",
              background: charging
                ? "linear-gradient(to bottom, transparent, #ff003344, transparent)"
                : "linear-gradient(to bottom, #ffffff, #ff0033 30%, #ff0033 70%, #ffffff)",
              boxShadow: charging
                ? "0 0 8px #ff0033"
                : "0 0 30px #ff0033, 0 0 60px #ff0033, inset 0 0 10px #ffffff",
              opacity: charging ? 0.6 : 1,
              animation: firing ? "laserPulse 0.1s linear infinite" : "none",
              zIndex: 4,
            }}
          />
        );
      })}

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
        {/* Health bar + name */}
        {!boss.isExploding && (
          <>
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-10 whitespace-nowrap"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "clamp(7px, 1.1vw, 10px)",
                color: "#ff0066",
                textShadow: "0 0 8px #ff0066, 0 0 16px #ff0066",
              }}
            >
              {boss.name}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-6 w-[140%] h-2 bg-black border border-red-500"
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
          </>
        )}

        {!boss.isExploding ? (
          boss.type === "crusher" ? <CrusherSprite /> :
          boss.type === "mothership" ? <MothershipSprite /> :
          <LaserBeastSprite />
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

      <style>{`
        @keyframes laserPulse {
          from { opacity: 0.85; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
});

const CrusherSprite = memo(() => (
  <div className="w-full h-full relative animate-pulse">
    {/* Massive armored asteroid-fist */}
    <div
      className="absolute inset-0 rounded-lg"
      style={{
        background: "radial-gradient(circle, #aa6600 0%, #663300 60%, #1a0a00 100%)",
        boxShadow: "0 0 40px #aa6600, inset 0 0 30px #ffaa00",
      }}
    />
    {/* Spikes/knuckles */}
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: "20%",
          height: "20%",
          background: "linear-gradient(135deg, #ffaa00, #663300)",
          left: `${10 + i * 22}%`,
          top: "-5%",
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
        }}
      />
    ))}
    {[0, 1, 2, 3].map((i) => (
      <div
        key={`b${i}`}
        className="absolute"
        style={{
          width: "20%",
          height: "20%",
          background: "linear-gradient(135deg, #663300, #ffaa00)",
          left: `${10 + i * 22}%`,
          bottom: "-5%",
          clipPath: "polygon(50% 100%, 100% 0%, 0% 0%)",
        }}
      />
    ))}
    {/* Glowing eyes */}
    <div
      className="absolute rounded-full"
      style={{ width: "15%", height: "15%", left: "25%", top: "30%", background: "#ff0000", boxShadow: "0 0 12px #ff0000" }}
    />
    <div
      className="absolute rounded-full"
      style={{ width: "15%", height: "15%", right: "25%", top: "30%", background: "#ff0000", boxShadow: "0 0 12px #ff0000" }}
    />
    {/* Mouth/cracks */}
    <div className="absolute" style={{ left: "20%", right: "20%", bottom: "25%", height: "8%", background: "#000", boxShadow: "inset 0 0 8px #ff6600" }} />
  </div>
));

const MothershipSprite = memo(() => (
  <div className="w-full h-full relative">
    {/* Saucer dome */}
    <div
      className="absolute"
      style={{
        left: "20%",
        right: "20%",
        top: "5%",
        height: "40%",
        borderRadius: "50% 50% 30% 30%",
        background: "linear-gradient(180deg, #00ffaa 0%, #006644 100%)",
        boxShadow: "0 0 20px #00ffaa, inset 0 0 20px #ffffff",
      }}
    />
    {/* Disc body */}
    <div
      className="absolute"
      style={{
        left: 0,
        right: 0,
        top: "40%",
        height: "30%",
        borderRadius: "50%",
        background: "linear-gradient(180deg, #888888 0%, #222222 50%, #444444 100%)",
        boxShadow: "0 0 30px #00ffaa, 0 0 60px #00ffaa44",
      }}
    />
    {/* Lights underneath */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="absolute rounded-full animate-pulse"
        style={{
          width: "8%",
          height: "8%",
          left: `${10 + i * 14}%`,
          top: "62%",
          background: i % 2 === 0 ? "#ffff00" : "#00ffff",
          boxShadow: `0 0 10px ${i % 2 === 0 ? "#ffff00" : "#00ffff"}`,
          animationDelay: `${i * 0.15}s`,
        }}
      />
    ))}
    {/* Hangar bay */}
    <div
      className="absolute"
      style={{
        left: "35%",
        right: "35%",
        top: "75%",
        height: "12%",
        background: "radial-gradient(ellipse, #ffff00 0%, #ff6600 60%, transparent 100%)",
        boxShadow: "0 0 15px #ffff00",
      }}
    />
  </div>
));

const LaserBeastSprite = memo(() => (
  <div className="w-full h-full relative animate-pulse">
    {/* Hexagonal core */}
    <div
      className="absolute inset-[10%]"
      style={{
        background: "radial-gradient(circle, #ff0066 0%, #220011 100%)",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        boxShadow: "0 0 40px #ff0066",
      }}
    />
    {/* Rotating beams indicator */}
    <div
      className="absolute inset-0 rounded-full animate-spin"
      style={{
        background: "conic-gradient(from 0deg, transparent 0%, #ff0033 5%, transparent 15%, transparent 50%, #ff0033 55%, transparent 65%, transparent 100%)",
        animationDuration: "4s",
        opacity: 0.4,
      }}
    />
    {/* Cyclops eye */}
    <div
      className="absolute"
      style={{
        left: "30%",
        right: "30%",
        top: "35%",
        height: "30%",
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffffff 0%, #ff0033 40%, #660000 100%)",
        boxShadow: "0 0 20px #ff0033, inset 0 0 10px #ffffff",
      }}
    />
    <div
      className="absolute"
      style={{
        left: "42%",
        right: "42%",
        top: "42%",
        height: "16%",
        borderRadius: "50%",
        background: "#000",
      }}
    />
    {/* Antenna prongs */}
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: "6%",
          height: "20%",
          left: `${15 + i * 25}%`,
          top: "-15%",
          background: "linear-gradient(to top, #ff0033, transparent)",
          boxShadow: "0 0 8px #ff0033",
        }}
      />
    ))}
  </div>
));

Boss.displayName = "Boss";
export default Boss;
