import React, { memo } from "react";
import { Wormhole } from "@/types/gameTypes";

const WormholePortal: React.FC<{ wormhole: Wormhole | null }> = memo(({ wormhole }) => {
  if (!wormhole) return null;

  const fadeOut = wormhole.age > 280; // fade after ~280 frames (~4.5s of 5s lifespan)

  return (
    <div
      className="absolute"
      style={{
        width: `${wormhole.size}%`,
        aspectRatio: "1 / 1",
        left: `${wormhole.x}%`,
        top: `${wormhole.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 6,
        opacity: fadeOut ? 0.3 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: "none",
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full animate-spin"
        style={{
          background: "conic-gradient(from 0deg, #ff00ff, #00ffff, #ffff00, #ff00ff)",
          animationDuration: "2s",
          boxShadow: "0 0 40px #ff00ff, 0 0 80px #00ffff66",
        }}
      />
      {/* Mid ring */}
      <div
        className="absolute inset-[12%] rounded-full animate-spin"
        style={{
          background: "conic-gradient(from 180deg, #00ffff, #ff00ff, #00ff88, #00ffff)",
          animationDuration: "1.2s",
          animationDirection: "reverse",
        }}
      />
      {/* Inner void */}
      <div
        className="absolute inset-[28%] rounded-full"
        style={{
          background: "radial-gradient(circle, #000 40%, #1a0033 100%)",
          boxShadow: "inset 0 0 20px #ff00ff",
        }}
      />
      {/* Label */}
      <div
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(6px, 1vw, 9px)",
          color: "#00ffff",
          textShadow: "0 0 8px #00ffff",
          animation: "blink 1s step-end infinite",
        }}
      >
        WORMHOLE
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
});

WormholePortal.displayName = "WormholePortal";
export default WormholePortal;
