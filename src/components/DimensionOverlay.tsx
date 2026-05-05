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
      {/* Background */}
      <div className="absolute inset-0" style={{ background: cfg.bg, zIndex: 0 }} />

      {/* Grid lines */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `
            linear-gradient(${cfg.gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${cfg.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "8% 8%",
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 0, background: `radial-gradient(ellipse at 50% 80%, ${cfg.accentColor}22 0%, transparent 70%)` }}
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
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: `${2 + (i % 3)}px`,
          height: `${40 + (i % 4) * 20}px`,
          left: `${(i * 8.5) % 100}%`,
          bottom: 0,
          background: i % 2 === 0 ? "#ff00ff55" : "#00ffff55",
          boxShadow: i % 2 === 0 ? "0 0 8px #ff00ff" : "0 0 8px #00ffff",
          animation: `buildingGlow ${1.5 + (i % 3) * 0.5}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
    <style>{`@keyframes buildingGlow { from { opacity: 0.3; } to { opacity: 0.8; } }`}</style>
  </div>
));

const LavaParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full"
        style={{
          width: `${8 + (i % 4) * 6}px`,
          height: `${8 + (i % 4) * 6}px`,
          left: `${(i * 13 + 5) % 90}%`,
          top: `${70 + (i % 3) * 10}%`,
          background: "radial-gradient(circle, #ffff00 0%, #ff4400 60%, transparent 100%)",
          boxShadow: "0 0 12px #ff4400",
          animation: `lavaBubble ${2 + (i % 3)}s ease-in-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes lavaBubble {
        0%   { transform: translateY(0) scale(1); opacity: 0.8; }
        50%  { transform: translateY(-30px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
      }
    `}</style>
  </div>
));

const IceParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {Array.from({ length: 16 }).map((_, i) => (
      <div
        key={i}
        className="absolute"
        style={{
          width: "2px",
          height: `${15 + (i % 4) * 8}px`,
          left: `${(i * 6.5) % 98}%`,
          top: `${(i * 7 + 10) % 80}%`,
          background: "linear-gradient(to bottom, #ffffff, #00ccff44)",
          boxShadow: "0 0 6px #00ccff",
          transform: `rotate(${(i % 6) * 30}deg)`,
          opacity: 0.5 + (i % 3) * 0.2,
        }}
      />
    ))}
  </div>
));

DimensionOverlay.displayName = "DimensionOverlay";
export default DimensionOverlay;
