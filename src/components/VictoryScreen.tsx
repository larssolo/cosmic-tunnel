import React, { useEffect, useRef, useState } from "react";

interface VictoryScreenProps {
  score: number;
  playerName: string;
  meteorHits: number;
  onRestart: () => void;
  onExit: () => void;
}

const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: Math.sin(i * 2.7) * 50 + 50,
  y: Math.cos(i * 1.9) * 50 + 50,
  size: 1 + (i % 3),
  delay: (i * 0.08) % 2,
}));

const FIREWORK_COLORS = ["#ff00ff", "#00ffff", "#ffff00", "#ff4400", "#00ff88", "#ff0088"];

const VictoryScreen: React.FC<VictoryScreenProps> = ({ score, playerName, meteorHits, onRestart, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"flash" | "text" | "full">("flash");
  const [letterIndex, setLetterIndex] = useState(0);

  const headline = "YOU WIN!";
  const subline = "COSMIC TUNNEL CONQUERED";

  // Phase progression
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("full"), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Typewriter for headline
  useEffect(() => {
    if (phase !== "text" && phase !== "full") return;
    if (letterIndex >= headline.length) return;
    const t = setTimeout(() => setLetterIndex(i => i + 1), 80);
    return () => clearTimeout(t);
  }, [phase, letterIndex]);

  // Fireworks canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    type Particle = { x: number; y: number; vx: number; vy: number; alpha: number; color: string; size: number };
    const particles: Particle[] = [];
    let animId = 0;
    let tick = 0;

    const spawnFirework = () => {
      const x = 10 + Math.random() * 80;
      const y = 10 + Math.random() * 60;
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3;
        particles.push({
          x: (x / 100) * canvas.width,
          y: (y / 100) * canvas.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          size: 1.5 + Math.random() * 2,
        });
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      tick++;
      if (tick % 28 === 0) spawnFirework();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= 0.018;
        if (p.alpha <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(animate);
    };

    // Start after flash phase
    const delay = setTimeout(() => { animId = requestAnimationFrame(animate); }, 800);
    return () => { clearTimeout(delay); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center flex-col"
      style={{ zIndex: 100, fontFamily: "'Press Start 2P', monospace", overflow: "hidden" }}
    >
      {/* Dark starfield base */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, #0a0028 0%, #000008 100%)" }} />

      {/* Twinkling stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: "#fff",
            animation: `twinkle ${1 + s.delay}s ease-in-out infinite alternate`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Fireworks canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Flash overlay */}
      {phase === "flash" && (
        <div
          className="absolute inset-0"
          style={{ background: "#fff", animation: "victoryFlash 0.8s ease-out forwards", zIndex: 10 }}
        />
      )}

      {/* Content */}
      {(phase === "text" || phase === "full") && (
        <div className="relative flex flex-col items-center gap-3 px-4 text-center" style={{ zIndex: 20 }}>

          {/* Scanline trophy */}
          <div style={{ fontSize: "clamp(40px, 10vw, 80px)", animation: "trophySpin 3s ease-out forwards" }}>
            🏆
          </div>

          {/* YOU WIN typewriter */}
          <h1
            style={{
              fontSize: "clamp(28px, 7vw, 64px)",
              color: "#ffff00",
              textShadow: "4px 4px 0 #ff8800, 8px 8px 0 #ff0000, 0 0 40px #ffff00, 0 0 80px #ffaa00",
              letterSpacing: "0.1em",
              animation: "rainbowShift 1s linear infinite",
            }}
          >
            {headline.slice(0, letterIndex)}
            <span style={{ opacity: letterIndex < headline.length ? 1 : 0, animation: "blink 0.5s step-end infinite" }}>█</span>
          </h1>

          {/* Subline */}
          {letterIndex >= headline.length && (
            <p
              style={{
                fontSize: "clamp(8px, 2vw, 14px)",
                color: "#00ffff",
                textShadow: "0 0 12px #00ffff",
                letterSpacing: "0.05em",
                animation: "fadeSlideUp 0.6s ease-out forwards",
              }}
            >
              {subline}
            </p>
          )}

          {/* Stats — only in full phase */}
          {phase === "full" && (
            <div
              className="mt-4 flex flex-col items-center gap-2"
              style={{ animation: "fadeSlideUp 0.8s ease-out forwards" }}
            >
              <div
                style={{
                  border: "3px solid #ff00ff",
                  padding: "12px 24px",
                  background: "rgba(0,0,0,0.7)",
                  boxShadow: "0 0 30px #ff00ff66, inset 0 0 20px rgba(255,0,255,0.1)",
                }}
              >
                <p style={{ fontSize: "clamp(7px, 1.5vw, 11px)", color: "#ffaaff", marginBottom: 6 }}>FINAL SCORE</p>
                <p style={{ fontSize: "clamp(18px, 4vw, 36px)", color: "#ffff00", textShadow: "0 0 20px #ffff00, 2px 2px 0 #ff8800" }}>
                  {String(score).padStart(8, "0")}
                </p>
                <p style={{ fontSize: "clamp(6px, 1.2vw, 10px)", color: "#00ff88", marginTop: 6 }}>
                  PILOT: {playerName} &nbsp;|&nbsp; METEORS: {meteorHits}
                </p>
              </div>

              <p
                style={{
                  fontSize: "clamp(7px, 1.4vw, 11px)",
                  color: "#ff00ff",
                  textShadow: "0 0 10px #ff00ff",
                  animation: "pulse 1s ease-in-out infinite alternate",
                  marginTop: 4,
                }}
              >
                ★ ★ ★ &nbsp; COSMIC HERO &nbsp; ★ ★ ★
              </p>

              <button
                onClick={onRestart}
                className="mt-4 transition-transform hover:scale-105 active:scale-95"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "clamp(8px, 1.8vw, 13px)",
                  padding: "14px 28px",
                  backgroundColor: "#ff00ff",
                  color: "#fff",
                  border: "4px solid #ffff00",
                  textShadow: "2px 2px 0 #000",
                  boxShadow: "0 0 30px #ff00ff, 4px 4px 0 #000",
                  cursor: "pointer",
                }}
              >
                ▶ PLAY AGAIN ◀
              </button>

              <button
                onClick={onExit}
                className="transition-transform hover:scale-105 active:scale-95"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "clamp(7px, 1.4vw, 11px)",
                  padding: "10px 20px",
                  backgroundColor: "transparent",
                  color: "#00ffff",
                  border: "2px solid #00ffff",
                  textShadow: "0 0 6px #00ffff",
                  boxShadow: "0 0 10px #00ffff66",
                  cursor: "pointer",
                }}
              >
                ✦ EXIT SPACESHIP ✦
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes victoryFlash {
          0%   { opacity: 1; }
          60%  { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes trophySpin {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(10deg); opacity: 1; }
          80%  { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes rainbowShift {
          0%   { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes twinkle {
          from { opacity: 0.2; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          from { opacity: 0.6; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VictoryScreen;
