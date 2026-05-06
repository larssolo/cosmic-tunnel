import React, { memo, useEffect, useRef, useState } from "react";
import { VoidEntity as VoidEntityType } from "@/types/gameTypes";

interface Props {
  voidEntity: VoidEntityType | null;
}

const VOID_DURATION = 60000;

const VoidEntityComponent: React.FC<Props> = ({ voidEntity }) => {
  const [tick, setTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!voidEntity) return;
    const animate = () => {
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [voidEntity]);

  if (!voidEntity) return null;

  const now = Date.now();
  const elapsed = now - voidEntity.startedAt;
  const progress = Math.min(elapsed / VOID_DURATION, 1); // 0→1 over 60s
  // Rise from bottom: at t=0 void covers 0% of screen, at t=60s covers 85%
  const voidHeightPct = progress * 85;
  const secondsLeft = Math.max(0, Math.ceil((VOID_DURATION - elapsed) / 1000));

  return (
    <>
      {/* Rising void wave */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: 0,
          height: `${voidHeightPct}%`,
          background: "linear-gradient(to top, #000000 0%, #0a0020 40%, #1a0040 70%, transparent 100%)",
          transition: "height 0.1s linear",
          zIndex: 10,
        }}
      >
        {/* Animated void particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${6 + (i % 4) * 4}px`,
              height: `${6 + (i % 4) * 4}px`,
              left: `${(i * 17 + (tick * (i % 3 === 0 ? 0.3 : -0.2)) + 100) % 100}%`,
              top: `${10 + (i % 5) * 15 + Math.sin((tick + i * 30) * 0.05) * 8}%`,
              background: i % 3 === 0 ? "#6600cc" : i % 3 === 1 ? "#cc00ff" : "#330066",
              opacity: 0.4 + Math.sin((tick + i * 20) * 0.07) * 0.3,
              boxShadow: `0 0 ${8 + i * 2}px ${i % 2 === 0 ? "#cc00ff" : "#6600cc"}`,
            }}
          />
        ))}

        {/* Wave crest */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: 0,
            height: "30px",
            background: "linear-gradient(to bottom, transparent, #6600cc88 40%, transparent)",
            boxShadow: "0 -4px 20px #cc00ff, 0 -8px 40px #6600cc",
          }}
        />

        {/* Tendrils rising from the wave */}
        {[15, 30, 45, 60, 75, 88].map((xPos, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${xPos + Math.sin((tick + i * 40) * 0.04) * 4}%`,
              top: `-${20 + Math.abs(Math.sin((tick + i * 25) * 0.06)) * 25}px`,
              width: "3px",
              height: `${20 + Math.abs(Math.sin((tick + i * 25) * 0.06)) * 25}px`,
              background: "linear-gradient(to top, #cc00ff, transparent)",
              opacity: 0.6 + Math.sin((tick + i * 15) * 0.08) * 0.4,
              borderRadius: "2px",
            }}
          />
        ))}
      </div>

      {/* Void cores — glowing weak points */}
      {voidEntity.cores.map((core) => {
        if (core.destroyed) return null;
        const coreY = 100 - voidHeightPct + 10 + (core.id % 3) * 8;
        if (coreY > 95) return null;
        return (
          <div
            key={core.id}
            className="absolute pointer-events-none"
            style={{
              left: `${core.x}%`,
              top: `${coreY}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 15,
            }}
          >
            {/* Outer glow */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #ffffff 0%, #ffdd00 30%, #ff6600 60%, transparent 100%)",
                boxShadow: `0 0 ${12 + Math.sin(tick * 0.12) * 6}px #ffdd00, 0 0 ${24 + Math.sin(tick * 0.08) * 10}px #ff6600`,
                animation: "voidCorePulse 0.8s ease-in-out infinite alternate",
              }}
            />
          </div>
        );
      })}

      {/* Top HUD — countdown + message */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{ top: "8px", zIndex: 60, textAlign: "center", fontFamily: "'Press Start 2P', monospace" }}
      >
        <p
          style={{
            color: "#cc00ff",
            fontSize: "clamp(10px, 2vw, 18px)",
            textShadow: "0 0 12px #cc00ff, 0 0 24px #6600cc, 3px 3px 0 #000",
            letterSpacing: "0.1em",
            animation: "voidTextFlicker 1.2s ease-in-out infinite alternate",
          }}
        >
          ☠ THE VOID AWAKENS ☠
        </p>
        <p
          style={{
            color: secondsLeft <= 10 ? "#ff0000" : "#ff6600",
            fontSize: "clamp(8px, 1.5vw, 14px)",
            textShadow: `0 0 8px ${secondsLeft <= 10 ? "#ff0000" : "#ff6600"}`,
            marginTop: "4px",
          }}
        >
          {secondsLeft}s REMAINING — SHOOT THE CORES!
        </p>
      </div>

      <style>{`
        @keyframes voidCorePulse {
          from { transform: scale(0.85); opacity: 0.8; }
          to   { transform: scale(1.15); opacity: 1; }
        }
        @keyframes voidTextFlicker {
          0%   { opacity: 1; }
          80%  { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
};

export default memo(VoidEntityComponent);
