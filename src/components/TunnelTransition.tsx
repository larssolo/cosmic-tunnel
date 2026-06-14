import { memo } from "react";

interface TunnelTransitionProps {
  isActive: boolean;
}

export const TunnelTransition = memo(({ isActive }: TunnelTransitionProps) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Left wedge — slides in from the left edge, apex meets center */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(0% 0%, 50% 50%, 0% 100%)",
          background:
            "linear-gradient(90deg, rgba(10,0,21,0.96) 0%, rgba(26,0,51,0.92) 55%, rgba(255,0,255,0.75) 92%, rgba(255,0,255,0) 100%)",
          animation: "wormhole-left 2.5s ease-in-out forwards",
        }}
      />
      {/* Right wedge — slides in from the right edge, apex meets center */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(100% 0%, 50% 50%, 100% 100%)",
          background:
            "linear-gradient(270deg, rgba(10,0,21,0.96) 0%, rgba(26,0,51,0.92) 55%, rgba(0,255,255,0.75) 92%, rgba(0,255,255,0) 100%)",
          animation: "wormhole-right 2.5s ease-in-out forwards",
        }}
      />

      {/* Neon edges tracing the hourglass slopes */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        style={{ animation: "wormhole-edges 2.5s ease-in-out forwards" }}
      >
        <line x1="0" y1="0" x2="50" y2="50" stroke="#ff00ff" strokeWidth="0.35" />
        <line x1="0" y1="100" x2="50" y2="50" stroke="#ff00ff" strokeWidth="0.35" />
        <line x1="100" y1="0" x2="50" y2="50" stroke="#00ffff" strokeWidth="0.35" />
        <line x1="100" y1="100" x2="50" y2="50" stroke="#00ffff" strokeWidth="0.35" />
      </svg>

      {/* Label sits at the pinch */}
      <div
        className="absolute top-1/2 left-1/2 whitespace-nowrap"
        style={{
          transform: "translate(-50%, -50%)",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(8px, 1.4vw, 14px)",
          color: "#00ffff",
          textShadow: "0 0 10px #00ffff, 0 0 20px #ff00ff, 2px 2px 0 #000",
          letterSpacing: "0.4em",
          animation: "wormhole-label 2.5s ease-in-out forwards",
        }}
      >
        WORM HOLE
      </div>

      <style>{`
        @keyframes wormhole-left {
          0%   { transform: translateX(-100%); }
          25%  { transform: translateX(0); }
          75%  { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        @keyframes wormhole-right {
          0%   { transform: translateX(100%); }
          25%  { transform: translateX(0); }
          75%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
        @keyframes wormhole-edges {
          0%, 100% { opacity: 0; filter: drop-shadow(0 0 0 transparent); }
          25%, 75% { opacity: 1; filter: drop-shadow(0 0 4px #ff00ff) drop-shadow(0 0 4px #00ffff); }
        }
        @keyframes wormhole-label {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          25%, 75% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
});

TunnelTransition.displayName = "TunnelTransition";
