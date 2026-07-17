import React from "react";

interface CountdownTimerProps {
  timeRemaining: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const critical = timeRemaining <= 10;
  const warning = timeRemaining <= 30;

  const color = critical ? "#ff2200" : warning ? "#ffff00" : "#00ff88";

  return (
    <div className="absolute top-[14%] left-1/2 -translate-x-1/2 pointer-events-none text-center" style={{ fontFamily: "'Press Start 2P', monospace" }}>
      <p style={{ color: "#00ffff", fontSize: "clamp(6px, 0.9vw, 9px)", textShadow: "0 0 6px #00ffff, 1px 1px 0 #000", letterSpacing: "0.15em", marginBottom: "4px" }}>
        ▓ ESCAPE THE TUNNEL ▓
      </p>
      <div
        style={{
          color,
          fontSize: "clamp(26px, 5vw, 48px)",
          textShadow: `0 0 18px ${color}, 0 0 36px ${color}66, 3px 3px 0 #000`,
          lineHeight: 1,
          animation: critical ? "timerPanic 0.5s ease-in-out infinite alternate" : undefined,
        }}
      >
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
      <style>{`
        @keyframes timerPanic {
          from { transform: scale(1); }
          to   { transform: scale(1.12); }
        }
      `}</style>
    </div>
  );
};
