
import React, { memo } from "react";

interface SpaceshipVesselProps {
  isInvulnerable: boolean;
  thrust?: number;
}

// Memoize the component to prevent unnecessary re-renders
const SpaceshipVessel: React.FC<SpaceshipVesselProps> = memo(({ isInvulnerable, thrust = 1 }) => {
  return (
    <div className={`relative w-full h-full ${isInvulnerable ? "animate-pulse opacity-80" : ""}`}>
      <svg viewBox="0 0 16 16" className="w-full h-full" style={{ shapeRendering: "crispEdges", overflow: "visible" }}>
        {/* nose */}
        <rect x="7" y="0" width="2" height="2" fill="#ffffff" />
        <rect x="7" y="2" width="2" height="1" fill="#9be8ff" />
        {/* body */}
        <rect x="6" y="3" width="4" height="6" fill="#00e5ff" />
        <rect x="6" y="3" width="1" height="6" fill="#7df4ff" />
        {/* cockpit */}
        <rect x="7" y="4" width="2" height="2" fill="#ff2d95" />
        <rect x="7" y="4" width="1" height="1" fill="#ff8ec6" />
        {/* wings */}
        <rect x="2" y="7" width="4" height="2" fill="#6E59A5" />
        <rect x="10" y="7" width="4" height="2" fill="#6E59A5" />
        <rect x="1" y="8" width="2" height="2" fill="#00e5ff" />
        <rect x="13" y="8" width="2" height="2" fill="#00e5ff" />
        {/* gun tips */}
        <rect x="2" y="6" width="1" height="1" fill="#ffff00" />
        <rect x="13" y="6" width="1" height="1" fill="#ffff00" />
        {/* engine block */}
        <rect x="5" y="9" width="6" height="2" fill="#1A1F2C" />
        <rect x="6" y="11" width="4" height="1" fill="#2b3245" />
        {/* flame — scaled vertically by thrust, anchored at its top (y=12) */}
        <g
          style={{
            transformBox: "fill-box",
            transformOrigin: "center top",
            transform: `scaleY(${thrust})`,
            transition: "transform 130ms ease-out",
          }}
        >
          {/* flame frame A */}
          <g className="flameA">
            <rect x="6" y="12" width="4" height="2" fill="#F97316" />
            <rect x="7" y="14" width="2" height="1" fill="#ffff00" />
          </g>
          {/* flame frame B */}
          <g className="flameB">
            <rect x="6" y="12" width="4" height="1" fill="#F97316" />
            <rect x="7" y="13" width="2" height="2" fill="#ff4500" />
            <rect x="7" y="15" width="2" height="1" fill="#ffff00" />
          </g>
        </g>
      </svg>
      {isInvulnerable && (
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-70"
          style={{ transform: "scale(1.3)", borderStyle: "dashed" }}
        />
      )}
      <style>{`
        .flameA { animation: flameFlickA 0.22s steps(1) infinite; }
        .flameB { animation: flameFlickB 0.22s steps(1) infinite; }
        @keyframes flameFlickA { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes flameFlickB { 0%, 49% { opacity: 0; } 50%, 100% { opacity: 1; } }
      `}</style>
    </div>
  );
});

export default SpaceshipVessel;
