import { memo } from "react";

interface SpeedRingProps {
  ring: { id: number; x: number; y: number } | null;
}

const SpeedRing = memo(({ ring }: SpeedRingProps) => {
  if (!ring) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${ring.x}%`,
        top: `${ring.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 6,
        width: "52px",
        height: "52px",
      }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full" style={{
        border: "3px solid #00ffff",
        boxShadow: "0 0 10px #00ffff, 0 0 20px #00ffff44",
        animation: "ringPulse 1.2s ease-in-out infinite alternate",
      }} />
      {/* Mid ring */}
      <div className="absolute inset-[10px] rounded-full" style={{
        border: "2px solid #ff00ff",
        boxShadow: "0 0 8px #ff00ff88",
        animation: "ringPulse 1.2s ease-in-out infinite alternate-reverse",
      }} />
      {/* Centre dot */}
      <div className="absolute inset-[20px] rounded-full" style={{
        background: "radial-gradient(circle, #ffffff 0%, #00ffff 60%, transparent 100%)",
        opacity: 0.9,
      }} />
      {/* Label */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px",
        color: "#00ffff",
        textShadow: "0 0 6px #00ffff",
      }}>
        SPEED RING
      </div>
      <style>{`
        @keyframes ringPulse {
          from { opacity: 0.6; transform: scale(0.95); }
          to   { opacity: 1;   transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
});

SpeedRing.displayName = "SpeedRing";
export default SpeedRing;
