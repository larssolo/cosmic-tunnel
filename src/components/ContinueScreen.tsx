import React, { useEffect, useState } from "react";

interface ContinueScreenProps {
  onContinue: () => void;
  onGameOver: () => void;
}

const ContinueScreen: React.FC<ContinueScreenProps> = ({ onContinue, onGameOver }) => {
  const [seconds, setSeconds] = useState(9);

  useEffect(() => {
    if (seconds <= 0) { onGameOver(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onGameOver]);

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ zIndex: 90, background: "rgba(0,0,0,0.92)", fontFamily: "'Press Start 2P', monospace" }}
    >
      <p style={{ fontSize: "clamp(10px, 2vw, 16px)", color: "#ff0080", textShadow: "0 0 12px #ff0080", marginBottom: "1rem", animation: "blink 0.8s step-end infinite" }}>
        CONTINUE?
      </p>

      {/* Giant countdown number */}
      <div
        style={{
          fontSize: "clamp(80px, 20vw, 160px)",
          color: seconds <= 3 ? "#ff2200" : "#ffff00",
          textShadow: seconds <= 3
            ? "0 0 40px #ff2200, 0 0 80px #ff4400, 4px 4px 0 #880000"
            : "0 0 40px #ffff00, 0 0 80px #ffaa00, 4px 4px 0 #886600",
          lineHeight: 1,
          transition: "color 0.2s, text-shadow 0.2s",
        }}
      >
        {seconds}
      </div>

      <p style={{ fontSize: "clamp(7px, 1.4vw, 11px)", color: "#aaa", margin: "1.5rem 0 2rem" }}>
        INSERT COIN TO CONTINUE
      </p>

      <button
        onClick={onContinue}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px, 1.8vw, 14px)",
          padding: "14px 32px",
          background: "#ff00ff",
          color: "#fff",
          border: "4px solid #ffff00",
          textShadow: "2px 2px 0 #000",
          boxShadow: "0 0 30px #ff00ff, 4px 4px 0 #000",
          cursor: "pointer",
          animation: "continuePulse 0.6s ease-in-out infinite alternate",
        }}
      >
        ▶ CONTINUE ◀
      </button>

      <button
        onClick={onGameOver}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(7px, 1.2vw, 10px)",
          marginTop: "1rem",
          padding: "8px 20px",
          background: "transparent",
          color: "#555",
          border: "2px solid #555",
          cursor: "pointer",
        }}
      >
        GAME OVER
      </button>

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes continuePulse {
          from { transform: scale(0.97); box-shadow: 0 0 20px #ff00ff, 4px 4px 0 #000; }
          to   { transform: scale(1.03); box-shadow: 0 0 50px #ff00ff, 4px 4px 0 #000; }
        }
      `}</style>
    </div>
  );
};

export default ContinueScreen;
