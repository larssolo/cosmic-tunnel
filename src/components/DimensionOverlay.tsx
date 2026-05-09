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
      {/* Edge vignette — clear centre, coloured borders */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          background: `radial-gradient(ellipse 55% 55% at 50% 50%, transparent 0%, ${cfg.accentColor}18 60%, ${cfg.accentColor}55 100%)`,
        }}
      />

      {/* Grid lines — only visible at edges via vignette mask */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundImage: `
            linear-gradient(${cfg.gridColor} 1px, transparent 1px),
            linear-gradient(90deg, ${cfg.gridColor} 1px, transparent 1px)
          `,
          backgroundSize: "8% 8%",
          maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 30%, black 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, transparent 30%, black 100%)",
          opacity: 0.6,
        }}
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
    {/* Left edge columns */}
    {[0, 1, 2].map((i) => (
      <div key={`l${i}`} className="absolute" style={{
        width: "2px", height: `${50 + i * 20}px`,
        left: `${i * 4}%`, bottom: `${i * 8}%`,
        background: "#ff00ff44",
        animation: `buildingGlow ${1.8 + i * 0.4}s ease-in-out infinite alternate`,
        animationDelay: `${i * 0.25}s`,
      }} />
    ))}
    {/* Right edge columns */}
    {[0, 1, 2].map((i) => (
      <div key={`r${i}`} className="absolute" style={{
        width: "2px", height: `${50 + i * 20}px`,
        right: `${i * 4}%`, bottom: `${i * 8}%`,
        background: "#00ffff44",
        animation: `buildingGlow ${2 + i * 0.4}s ease-in-out infinite alternate`,
        animationDelay: `${i * 0.3}s`,
      }} />
    ))}
    <style>{`@keyframes buildingGlow { from { opacity: 0.2; } to { opacity: 0.55; } }`}</style>
  </div>
));

const LavaParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {/* Bubbles only at left/right bottom edges */}
    {[0, 1, 2, 3].map((i) => {
      const onLeft = i < 2;
      return (
        <div key={i} className="absolute rounded-full" style={{
          width: `${8 + (i % 2) * 5}px`, height: `${8 + (i % 2) * 5}px`,
          [onLeft ? "left" : "right"]: `${(i % 2) * 5 + 1}%`,
          bottom: `${5 + (i % 2) * 10}%`,
          background: "radial-gradient(circle, #ff6600 0%, #ff2200 70%, transparent 100%)",
          opacity: 0.5,
          animation: `lavaBubble ${2.5 + i * 0.4}s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
        }} />
      );
    })}
    <style>{`
      @keyframes lavaBubble {
        0%   { transform: translateY(0) scale(1); opacity: 0.5; }
        60%  { transform: translateY(-25px) scale(1.1); opacity: 0.65; }
        100% { transform: translateY(-50px) scale(0.3); opacity: 0; }
      }
    `}</style>
  </div>
));

const IceParticles = memo(() => (
  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
    {/* Ice shards pinned to left and right edges */}
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const onLeft = i < 3;
      return (
        <div key={i} className="absolute" style={{
          width: "1px",
          height: `${18 + (i % 3) * 8}px`,
          [onLeft ? "left" : "right"]: `${(i % 3) * 3}%`,
          top: `${15 + (i % 3) * 22}%`,
          background: "linear-gradient(to bottom, #aaeeff88, transparent)",
          transform: `rotate(${onLeft ? -(i % 3) * 15 - 10 : (i % 3) * 15 + 10}deg)`,
          opacity: 0.3 + (i % 3) * 0.1,
        }} />
      );
    })}
  </div>
));

DimensionOverlay.displayName = "DimensionOverlay";
export default DimensionOverlay;
