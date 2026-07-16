
import React, { memo } from "react";
import { Obstacle, DimensionType } from "@/types/gameTypes";

interface ObstaclesProps {
  obstacles: Obstacle[];
  dimension?: DimensionType | null;
  bonusRound?: boolean;
}

// Memoize individual obstacles to prevent unnecessary re-renders
const ObstacleItem = memo(({ obstacle, dimension, bonusRound }: { obstacle: Obstacle; dimension?: DimensionType | null; bonusRound?: boolean }) => {
  if (bonusRound && !obstacle.isExploding) {
    return (
      <div
        className="absolute"
        style={{
          width: `${obstacle.size}%`,
          height: `${obstacle.size}%`,
          aspectRatio: "1 / 1",
          left: `${obstacle.x}%`,
          top: `${obstacle.y}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: "radial-gradient(circle at 35% 35%, #ffffaa 0%, #ffdd00 40%, #aa6600 100%)",
            boxShadow: "0 0 14px #ffdd00, 0 0 28px #ffaa00, inset 0 0 6px #ffffff",
            border: "1px solid #ffaa00",
          }}
        />
        <div
          className="absolute inset-[28%] flex items-center justify-center"
          style={{
            color: "#aa6600",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "60%",
            textShadow: "0 0 4px #ffffaa",
          }}
        >
          $
        </div>
      </div>
    );
  }

  // Dimension-specific styles
  const getDimStyle = () => {
    if (dimension === 'neon_city') {
      return {
        borderRadius: "4px",
        background: "linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)",
        boxShadow: "0 0 20px #ff00ff, 0 0 40px #00ffff44",
      };
    }
    if (dimension === 'lava_zone') {
      return {
        borderRadius: "50%",
        background: "radial-gradient(circle, #ffff00 0%, #ff4400 60%, #660000 100%)",
        boxShadow: "0 0 25px #ff4400, 0 0 50px #ff440044",
      };
    }
    if (dimension === 'ice_field') {
      return {
        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
        background: "linear-gradient(135deg, #ffffff 0%, #00ccff 50%, #003366 100%)",
        boxShadow: "0 0 20px #00ccff, 0 0 40px #00ccff44",
      };
    }
    return null;
  };

  const dimStyle = getDimStyle();

  return (
    <div
      className={`absolute ${!dimStyle ? 'rounded-full' : ''} ${obstacle.isExploding ? 'animate-pulse' : ''}`}
      style={{
        width: `${obstacle.size}%`,
        height: `${obstacle.size}%`,
        aspectRatio: "1 / 1",
        left: `${obstacle.x}%`,
        top: `${obstacle.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: obstacle.isExploding ? "0.8" : "1",
        transition: "opacity 0.3s ease-out",
      }}
    >
      {!obstacle.isExploding ? (
        dimStyle ? (
          <div className="w-full h-full" style={{ ...dimStyle, width: "100%", height: "100%" }} />
        ) : (
        // Rocky meteor: irregular shape, ember rim, fire trail, slow rotation
        (() => {
          const seed = obstacle.seed ?? 0.5;
          const spinDur = 6 + seed * 10;
          const spinDir = seed > 0.5 ? "normal" : "reverse";
          const br = `${38 + seed * 20}% ${62 - seed * 20}% ${45 + seed * 15}% ${55 - seed * 15}% / ${50 + seed * 12}% ${40 + seed * 18}% ${60 - seed * 18}% ${50 - seed * 12}%`;
          return (
            <div className="w-full h-full relative">
              {/* Fire trail — points up because meteors fall down; tilts with drift */}
              <div
                className="absolute left-1/2"
                style={{
                  width: "55%", height: "150%", bottom: "45%",
                  transform: `translateX(-50%) rotate(${(obstacle.vx ?? 0) * -150}deg)`,
                  transformOrigin: "bottom center",
                  background: "linear-gradient(to top, rgba(255,140,0,0.5) 0%, rgba(255,60,0,0.22) 45%, transparent 100%)",
                  filter: "blur(3px)", borderRadius: "50%",
                }}
              />
              {/* Rock body */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: br,
                  background: `radial-gradient(circle at ${30 + seed * 20}% ${25 + seed * 20}%, #8a7060 0%, #4a3f38 45%, #201a16 100%)`,
                  boxShadow:
                    "0 0 12px rgba(255,120,0,0.55), inset -3px -4px 8px rgba(0,0,0,0.8), inset 2px 2px 4px rgba(255,160,60,0.28)",
                  border: "1px solid rgba(255,140,40,0.5)",
                  animation: `meteorSpin ${spinDur}s linear infinite ${spinDir}`,
                }}
              >
                <div className="absolute rounded-full bg-black/50" style={{ width: "24%", height: "24%", top: `${15 + seed * 20}%`, left: `${25 + seed * 25}%` }} />
                <div className="absolute rounded-full bg-black/40" style={{ width: "16%", height: "16%", top: `${55 + seed * 12}%`, left: `${60 - seed * 20}%` }} />
              </div>
            </div>
          );
        })()
        )
      ) : (
        // Enhanced explosion effect with consistent fragment size and distribution
        <div className="relative w-full h-full" style={{aspectRatio: "1 / 1"}}>
          {/* Core explosion */}
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse" 
               style={{aspectRatio: "1 / 1"}}></div>
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping opacity-90"
               style={{aspectRatio: "1 / 1"}}></div>
          <div className="absolute inset-2/5 rounded-full bg-white animate-pulse"
               style={{aspectRatio: "1 / 1"}}></div>
          
          {/* Shockwave effect */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30"
               style={{animationDuration: "0.8s", aspectRatio: "1 / 1"}}></div>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-200 animate-ping opacity-20"
               style={{animationDuration: "1.2s", aspectRatio: "1 / 1"}}></div>
          
          {/* 30 explosion fragments with consistent patterns */}
          {Array.from({ length: 30 }).map((_, i) => {
            // Use fixed angles that divide the circle evenly
            const angle = (i * 12); // 360 degrees / 30 fragments = 12 degrees per fragment
            const distance = 40 + (Math.floor(i / 6) * 8); // Create 5 rings of fragments at different distances
            const fragmentSize = 2 + (i % 3); // Only 3 possible sizes (2%, 3%, or 4%)
            const speed = 0.4 + (i % 3) * 0.2; // 3 possible speeds
            const delay = (i % 5) * 0.05; // 5 possible delays, evenly distributed
            
            // Calculate position based on angle and distance
            const xPos = 50 + distance * Math.cos(angle * Math.PI / 180);
            const yPos = 50 + distance * Math.sin(angle * Math.PI / 180);
            
            // Use a predictable pattern for fragment colors
            const fragmentType = i % 5;
            const colors = ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-red-500', 'bg-gray-700'];
            const color = colors[fragmentType];
            
            // Always use rounded shapes for consistency
            const shape = 'rounded-full';
            
            return (
              <div 
                key={`fragment-${i}`}
                className={`absolute ${color} ${shape} animate-ping`}
                style={{
                  width: `${fragmentSize}%`,
                  height: `${fragmentSize}%`,
                  aspectRatio: "1 / 1", // Enforce circle aspect
                  top: `${yPos}%`,
                  left: `${xPos}%`,
                  animationDuration: `${speed}s`,
                  animationDelay: `${delay}s`,
                  opacity: 0.8,
                  transform: `rotate(${angle}deg)`,
                  boxShadow: '0 0 3px rgba(255, 165, 0, 0.8)'
                }}
              ></div>
            );
          })}
          
          {/* Flying debris pieces - consistent size and directions */}
          {Array.from({ length: 6 }).map((_, i) => {
            // Evenly distribute 6 pieces around the circle
            const angle = i * 60; // 360 degrees / 6 = 60 degrees
            const xPos = 50 + 60 * Math.cos(angle * Math.PI / 180);
            const yPos = 50 + 60 * Math.sin(angle * Math.PI / 180);
            
            return (
              <div 
                key={`debris-${i}`}
                className="absolute bg-gray-700 rounded-sm"
                style={{
                  width: `${4}%`,
                  height: `${2}%`,
                  top: `${yPos}%`,
                  left: `${xPos}%`,
                  transform: `rotate(${angle}deg)`,
                  animation: `fade-out 0.6s ease-out forwards`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            );
          })}
        </div>
      )}
    </div>
  );
});

// Memoize the entire Obstacles component
const Obstacles: React.FC<ObstaclesProps> = memo(({ obstacles, dimension, bonusRound }) => {
  return (
    <>
      {obstacles.map((obstacle) => (
        <ObstacleItem key={obstacle.id} obstacle={obstacle} dimension={dimension} bonusRound={bonusRound} />
      ))}
      <style>{`@keyframes meteorSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
});

export default Obstacles;
