import React, { memo } from "react";
import { GravityWell as GravityWellType } from "@/types/gameTypes";

const STREAKS = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  angle: i * 45,
  delay: (i % 4) * 0.18,
}));

const GravityWell: React.FC<{ well: GravityWellType | null }> = memo(({ well }) => {
  if (!well) return null;

  return (
    <div
      className="absolute"
      style={{
        width: `${well.size}%`,
        aspectRatio: "1 / 1",
        left: `${well.x}%`,
        top: `${well.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 6,
        pointerEvents: "none",
        // CSS drives the full 8s lifecycle: collapse-in → hold → collapse-out
        animation: "gravityWellLife 8s ease forwards",
      }}
    >
      {/* Infalling matter streaks spiralling toward the core */}
      {STREAKS.map((s) => (
        <div
          key={s.id}
          className="absolute left-1/2 top-1/2"
          style={{
            width: "6%",
            height: "55%",
            marginLeft: "-3%",
            marginTop: "-27.5%",
            transformOrigin: "center bottom",
            background: "linear-gradient(to top, transparent, #ff00ffaa, #00ffffcc)",
            filter: "blur(0.5px)",
            ["--a" as string]: `${s.angle}deg`,
            animation: `gravityInfall 1.4s linear ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Outer accretion ring */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(from 0deg, #cc00ff88, #ff00ffaa, #00ffffaa, #6600cc88, #cc00ff88)",
          animationDuration: "2.4s",
          boxShadow: "0 0 18px #cc00ff88, 0 0 36px #6600cc55",
        }}
      />
      {/* Inner accretion ring — counter-rotating */}
      <div
        className="absolute inset-[16%] rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(from 180deg, #00ffffaa, #cc00ffaa, #ff00ff88, #00ffffaa)",
          animationDuration: "1.4s",
          animationDirection: "reverse",
        }}
      />
      {/* Event horizon — the black core */}
      <div
        className="absolute inset-[34%] rounded-full"
        style={{
          background: "radial-gradient(circle, #000 55%, #1a0033 88%, #6600cc 100%)",
          boxShadow: "inset 0 0 14px #00000088, 0 0 14px #cc00ff66, 0 0 30px #6600cc55",
        }}
      />

      {/* Label */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(6px, 1vw, 9px)",
          color: "#cc00ff",
          textShadow: "0 0 8px #cc00ff, 0 0 14px #6600cc",
          animation: "blink 1s step-end infinite",
        }}
      >
        GRAVITY WELL
      </div>

      <style>{`
        @keyframes gravityWellLife {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(0deg); }
          8%   { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(20deg); }
          85%  { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.1) rotate(60deg); }
        }
        @keyframes gravityInfall {
          0%   { transform: rotate(var(--a)) translateY(-130%) scaleY(1); opacity: 0; }
          25%  { opacity: 1; }
          100% { transform: rotate(calc(var(--a) + 45deg)) translateY(0%) scaleY(0.25); opacity: 0; }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
    </div>
  );
});

GravityWell.displayName = "GravityWell";
export default GravityWell;
