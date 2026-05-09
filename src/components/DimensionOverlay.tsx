import React, { memo, useState, useEffect } from "react";
import { ActiveDimension, DimensionType } from "@/types/gameTypes";

const DIMENSION_CONFIG: Record<DimensionType, {
  label: string;
  bg: string;
  accentColor: string;
  gridColor: string;
}> = {
  neon_city: {
    label: "⚡ NEON CITY",
    bg: "linear-gradient(180deg, #0d001a 0%, #1a0033 50%, #000a1a 100%)",
    accentColor: "#ff00ff",
    gridColor: "rgba(0,255,255,0.12)",
  },
  lava_zone: {
    label: "🌋 LAVA ZONE",
    bg: "linear-gradient(180deg, #1a0000 0%, #330800 60%, #0a0000 100%)",
    accentColor: "#ff4400",
    gridColor: "rgba(255,100,0,0.12)",
  },
  ice_field: {
    label: "❄ ICE FIELD",
    bg: "linear-gradient(180deg, #000a1a 0%, #001033 60%, #000510 100%)",
    accentColor: "#00ccff",
    gridColor: "rgba(0,200,255,0.10)",
  },
};

const DimensionOverlay: React.FC<{ dimension: ActiveDimension | null }> = memo(({ dimension }) => {
  // Internal countdown — updates once per second, no game-loop setState needed
  const [secsLeft, setSecsLeft] = useState(0);

  useEffect(() => {
    if (!dimension) return;
    const update = () => setSecsLeft(Math.max(0, Math.ceil((dimension.endTime - Date.now()) / 1000)));
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [dimension?.endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!dimension) return null;

  const cfg = DIMENSION_CONFIG[dimension.type];

  return (
    <>
      {/* Background tint — semi-transparent so meteors stay visible */}
      <div className="absolute inset-0" style={{ background: cfg.bg, zIndex: 0, opacity: 0.35 }} />

      {/* Grid lines — subtle */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `
            linear-gradient(${cfg.gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${cfg.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "8% 8%",
          opacity: 0.4,
        }}
      />

      {/* Ambient glow — reduced */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 0, background: `radial-gradient(ellipse at 50% 90%, ${cfg.accentColor}0d 0%, transparent 55%)` }}
      />

      {/* Top HUD bar */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2"
        style={{
          zIndex: 20,
          background: `${cfg.accentColor}22`,
          borderBottom: `2px solid ${cfg.accentColor}`,
          boxShadow: `0 0 20px ${cfg.accentColor}66`,
          fontFamily: "'Press Start 2P', monospace",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: cfg.accentColor, fontSize: "clamp(8px, 1.5vw, 13px)", textShadow: `0 0 12px ${cfg.accentColor}`, animation: "dimPulse 0.8s ease-in-out infinite alternate" }}>
          {cfg.label}
        </span>
        <span style={{ color: "#ffffff", fontSize: "clamp(7px, 1.2vw, 11px)", textShadow: `0 0 8px ${cfg.accentColor}` }}>
          {secsLeft}s
        </span>
      </div>

      {/* Dimension-specific particles */}
      {dimension.type === "neon_city" && <NeonCityParticles />}
      {dimension.type === "lava_zone" && <LavaParticles />}
      {dimension.type === "ice_field" && <IceParticles />}

      <style>{`@keyframes dimPulse { from { opacity: 0.7; } to { opacity: 1; } }`}</style>
    </>
  );
});

const NeonCityParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: "2px",
          height: `${30 + (i % 3) * 15}px`,
          left: `${(i * 17) % 100}%`,
          bottom: 0,
          background: i % 2 === 0 ? "#ff00ff33" : "#00ffff33",
          animation: `buildingGlow ${2 + (i % 3) * 0.6}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.3}s`,
        }}
      />
    ))}
    <style>{`@keyframes buildingGlow { from { opacity: 0.15; } to { opacity: 0.4; } }`}</style>
  </div>
));

const LavaParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${6 + (i % 3) * 4}px`,
          height: `${6 + (i % 3) * 4}px`,
          left: `${(i * 20 + 5) % 90}%`,
          top: `${75 + (i % 3) * 8}%`,
          background: "radial-gradient(circle, #ff6600 0%, #ff2200 70%, transparent 100%)",
          opacity: 0.45,
          animation: `lavaBubble ${2.5 + (i % 3)}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes lavaBubble {
        0%   { transform: translateY(0) scale(1); opacity: 0.45; }
        50%  { transform: translateY(-20px) scale(1.1); opacity: 0.6; }
        100% { transform: translateY(-45px) scale(0.4); opacity: 0; }
      }
    `}</style>
  </div>
));

const IceParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: "1px",
          height: `${12 + (i % 4) * 6}px`,
          left: `${(i * 13) % 98}%`,
          top: `${(i * 11 + 15) % 75}%`,
          background: "linear-gradient(to bottom, #ffffff66, transparent)",
          transform: `rotate(${(i % 6) * 30}deg)`,
          opacity: 0.25 + (i % 3) * 0.1,
        }}
      />
    ))}
  </div>
));

DimensionOverlay.displayName = "DimensionOverlay";
export default DimensionOverlay;
