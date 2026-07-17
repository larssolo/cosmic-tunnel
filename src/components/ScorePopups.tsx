import React, { memo } from "react";
import { ScorePopup } from "@/hooks/useGameState";

interface ScorePopupsProps {
  popups: ScorePopup[];
}

// Floating "+150"-style numbers that rise and fade from each kill site
const ScorePopups: React.FC<ScorePopupsProps> = memo(({ popups }) => {
  if (popups.length === 0) return null;
  return (
    <>
      {popups.map((p) => (
        <div
          key={p.id}
          className="absolute pointer-events-none z-[60]"
          style={{
            left: `${Math.max(4, Math.min(96, p.x))}%`,
            top: `${Math.max(4, Math.min(96, p.y))}%`,
            transform: "translate(-50%, -50%)",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(9px, 1.4vw, 13px)",
            color: p.color,
            textShadow: `0 0 8px ${p.color}, 2px 2px 0 #000`,
            animation: "scoreFloat 0.9s ease-out forwards",
          }}
        >
          {p.text}
        </div>
      ))}
    </>
  );
});

export default ScorePopups;
