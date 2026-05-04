import React, { useEffect, useState } from "react";

interface StarWarsCrawlProps {
  onDone: () => void;
}

const StarWarsCrawl: React.FC<StarWarsCrawlProps> = ({ onDone }) => {
  const [fading, setFading] = useState(false);

  const finish = () => {
    setFading(true);
    setTimeout(onDone, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(finish, 13000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-end overflow-hidden cursor-pointer"
      style={{
        background: "radial-gradient(ellipse at center, #0a0020 0%, #000 100%)",
        opacity: fading ? 0 : 1,
        transition: "opacity 1s ease",
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

      {/* "A long time ago..." */}
      <div
        className="absolute top-12 text-center text-sm md:text-base px-8"
        style={{
          color: "#4fc3f7",
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(8px, 1.5vw, 14px)",
          animation: "fadeInOut 3s ease forwards",
          letterSpacing: "0.05em",
        }}
      >
        A long time ago, in a galaxy far, far away...
      </div>

      {/* 3D perspective crawl container */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          perspective: "350px",
          perspectiveOrigin: "50% 100%",
          height: "100%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "50% 100%",
            transform: "rotateX(25deg)",
            animation: "crawl 13s linear forwards",
            animationDelay: "2s",
          }}
        >
          <div
            className="mx-auto px-4 md:px-8 text-center space-y-5 pb-8"
            style={{
              maxWidth: "600px",
              paddingTop: "100vh",
              fontFamily: "'Press Start 2P', monospace",
              color: "#FFE81F",
            }}
          >
            <p
              className="text-xl md:text-3xl font-bold mb-6 leading-tight"
              style={{ textShadow: "0 0 20px #FFE81F", fontSize: "clamp(14px, 3vw, 28px)" }}
            >
              COSMIC TUNNEL
            </p>

            <p style={{ fontSize: "clamp(7px, 1.2vw, 11px)", lineHeight: 2.2, opacity: 0.9 }}>
              The galaxy is under threat from an endless swarm of meteors hurtling through
              the cosmic tunnel. Only the bravest pilots dare to enter.
            </p>

            <div
              className="border-t border-b my-4 py-4"
              style={{ borderColor: "#FFE81F55" }}
            >
              <p
                className="mb-4"
                style={{ fontSize: "clamp(8px, 1.4vw, 12px)", color: "#00ffff" }}
              >
                ── HOW TO FLY ──
              </p>
              <div
                className="text-left space-y-3 mx-auto"
                style={{ fontSize: "clamp(7px, 1.1vw, 10px)", maxWidth: "420px", lineHeight: 2.2 }}
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
              style={{ fontSize: "clamp(7px, 1.1vw, 10px)", maxWidth: "420px", lineHeight: 2.2 }}
            >
              <p style={{ color: "#ff00ff" }}>── POWER-UPS ──</p>
              <p>🛡 SHIELD — temporary invincibility</p>
              <p>⚡ RAPID FIRE — faster shooting</p>
              <p>🐌 SLOW MO — meteors slow down</p>
              <p>✖2 SCORE BOOST — double points</p>
              <p>❤ HEALTH — restore one life</p>
            </div>

            <p
              className="mt-8 text-center"
              style={{ fontSize: "clamp(8px, 1.4vw, 12px)", color: "#00ff00", textShadow: "0 0 8px #00ff00" }}
            >
              May the stars guide your path, pilot.
            </p>
          </div>
        </div>
      </div>

      {/* Skip hint */}
      <div
        className="absolute bottom-4 text-center w-full"
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(7px, 1vw, 10px)",
          color: "#ffffff55",
          animation: "blink 1.2s step-end infinite",
        }}
      >
        CLICK / TAP TO SKIP
      </div>

      <style>{`
        @keyframes crawl {
          from { transform: translateY(0); }
          to   { transform: translateY(-220%); }
        }
        @keyframes fadeInOut {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          70%  { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StarWarsCrawl;
