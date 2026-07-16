
import React, { memo } from "react";

// Pre-generate flashes for better performance
const generateFlashes = () => {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    size: Math.random() * 30 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }));
};

const STAR_LAYERS = [
  { count: 40, sizeMin: 1,   sizeMax: 2,   opacity: 0.45, baseDuration: 70 }, // far
  { count: 22, sizeMin: 1.5, sizeMax: 2.5, opacity: 0.7,  baseDuration: 34 }, // mid
  { count: 10, sizeMin: 2,   sizeMax: 3.5, opacity: 1,    baseDuration: 16 }, // near
];

const generateLayerStars = (count: number, sizeMin: number, sizeMax: number) =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * (sizeMax - sizeMin) + sizeMin,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 5 === 0 ? "#D6BCFA" : i % 3 === 0 ? "#9b87f5" : "#fff",
  }));

const ScrollingStars = memo(({ speedMultiplier }: { speedMultiplier: number }) => {
  const layers = React.useMemo(
    () => STAR_LAYERS.map((l) => ({ ...l, stars: generateLayerStars(l.count, l.sizeMin, l.sizeMax) })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden opacity-90">
      {layers.map((layer, li) => (
        <div
          key={li}
          className="absolute inset-x-0"
          style={{
            top: "-100%",
            height: "200%",
            animation: `starScroll ${layer.baseDuration / speedMultiplier}s linear infinite`,
            willChange: "transform",
          }}
        >
          {[0, 1].map((half) => (
            <div key={half} className="absolute inset-x-0" style={{ top: `${half * 50}%`, height: "50%" }}>
              {layer.stars.map((s) => (
                <div
                  key={s.id}
                  className="absolute rounded-full"
                  style={{
                    width: `${s.size}px`, height: `${s.size}px`,
                    background: s.color, opacity: layer.opacity,
                    left: `${s.left}%`, top: `${s.top}%`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
      {/* Speed lines at high velocity (level 7+, speedMultiplier >= 2) */}
      {speedMultiplier >= 2 &&
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`sl-${i}`}
            className="absolute"
            style={{
              left: `${8 + i * 16}%`, top: "-20%", width: "1px", height: "90px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.35), transparent)",
              animation: `speedLine ${0.5 + (i % 3) * 0.2}s linear ${i * 0.13}s infinite`,
            }}
          />
        ))}
      <style>{`
        @keyframes starScroll { from { transform: translateY(0); } to { transform: translateY(50%); } }
        @keyframes speedLine { from { transform: translateY(0); } to { transform: translateY(140vh); } }
      `}</style>
    </div>
  );
});

// Memoize flashes
const Flashes = memo(() => {
  const flashes = React.useMemo(() => generateFlashes(), []);
  
  return (
    <div className="absolute inset-0">
      {flashes.map((flash) => (
        <div
          key={flash.id}
          className="absolute rounded-full animate-pulse opacity-0"
          style={{
            width: `${flash.size}px`,
            height: `${flash.size}px`,
            background: "radial-gradient(circle, rgba(155, 135, 245, 0.7) 0%, transparent 70%)",
            left: `${flash.left}%`,
            top: `${flash.top}%`,
            animationDuration: `${flash.duration}s`,
            animationDelay: `${flash.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

// Memoize the entire Tunnel component
const Tunnel = memo(({ speedMultiplier = 1 }: { speedMultiplier?: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background nebula effect - static */}
      <div className="absolute inset-0 opacity-30"
           style={{
             background: "radial-gradient(circle at 50% 50%, rgba(155, 135, 245, 0.3) 0%, transparent 70%)"
           }}></div>

      {/* Dynamic elements - memoized */}
      <ScrollingStars speedMultiplier={speedMultiplier} />
      <Flashes />
    </div>
  );
});

export default Tunnel;
