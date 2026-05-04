import React, { useState } from "react";

interface StarWarsCrawlProps {
  onDone: () => void;
}

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onDone }) => {
  const [fading, setFading] = useState(false);

  const finish = () => {
    setFading(true);
    setTimeout(onDone, 800);
  };

  return (
    <div
      className="absolute inset-0 z-40 overflow-hidden cursor-pointer"
      style={{
        background: "radial-gradient(ellipse at center, #0a0020 0%, #000 100%)",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.8s ease",
      }}
      onClick={finish}
    >
      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}

      {/* Content — slides up from bottom, stays centered */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: "slideUp 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards" }}
      >
        <div
          className="text-center px-6 md:px-12 space-y-4 max-w-xl w-full"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <p
            style={{
              color: "#FFE81F",
              fontSize: "clamp(14px, 4vw, 30px)",
              textShadow: "0 0 20px #FFE81F, 3px 3px 0 #000",
              marginBottom: "1.5rem",
            }}
          >
            COSMIC TUNNEL
          </p>

          <p
            style={{
              color: "#FFE81F",
              fontSize: "clamp(7px, 1.4vw, 11px)",
              lineHeight: 2.2,
              opacity: 0.9,
            }}
          >
            The galaxy is under threat from an endless swarm of meteors
            hurtling through the cosmic tunnel. Only the bravest pilots
            dare to enter.
          </p>

          <div
            className="py-4 mt-2"
            style={{ borderTop: "1px solid #FFE81F44", borderBottom: "1px solid #FFE81F44" }}
          >
            <p
              style={{
                color: "#00ffff",
                fontSize: "clamp(8px, 1.4vw, 12px)",
                marginBottom: "0.8rem",
              }}
            >
              ── HOW TO FLY ──
            </p>
            <div
              className="text-left space-y-2 mx-auto"
              style={{
                color: "#FFE81F",
                fontSize: "clamp(7px, 1.2vw, 10px)",
                maxWidth: "380px",
                lineHeight: 2.2,
              }}
            >
              <p>🖱 MOUSE — move left / right to steer</p>
              <p>📱 MOBILE — tilt phone to steer</p>
              <p>👆 TAP / CLICK — fire laser cannons</p>
              <p>⭐ POWER-UPS — collect for special abilities</p>
              <p>❤ LIVES — you have 3 before it's over</p>
            </div>
          </div>

          <div
            className="text-left space-y-2 mx-auto"
            style={{
              color: "#FFE81F",
              fontSize: "clamp(7px, 1.2vw, 10px)",
              maxWidth: "380px",
              lineHeight: 2.2,
            }}
          >
            <p style={{ color: "#ff00ff", textAlign: "center", fontSize: "clamp(8px, 1.4vw, 12px)" }}>── POWER-UPS ──</p>
            <p>🛡 SHIELD — temporary invincibility</p>
            <p>⚡ RAPID FIRE — faster shooting</p>
            <p>🐌 SLOW MO — meteors slow down</p>
            <p>✖2 SCORE BOOST — double points</p>
            <p>❤ HEALTH — restore one life</p>
          </div>

          <p
            style={{
              color: "#00ff00",
              fontSize: "clamp(8px, 1.4vw, 11px)",
              textShadow: "0 0 8px #00ff00",
              marginTop: "1rem",
            }}
          >
            May the stars guide your path, pilot.
          </p>
        </div>
      </div>

      {/* Click to continue */}
      <div
        className="absolute bottom-6 text-center w-full"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(7px, 1.2vw, 10px)",
          color: "#ffffff99",
          animation: "blink 1.2s step-end infinite",
        }}
      >
        CLICK / TAP TO CONTINUE
      </div>

      <style>{`
        @keyframes slideUp {
          0%   { transform: translateY(80%); opacity: 0; }
          30%  { opacity: 1; }
          100% { transform: translateY(0%); opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StarWarsCrawl;
