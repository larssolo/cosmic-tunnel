import React, { memo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface TunnelObstaclesProps {
  obstacles: Obstacle[];
}

const TunnelObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  // Calculate position on tunnel perimeter
  const angle = obstacle.angle || 0;
  const tunnelRadius = 35; // Percentage from center
  const centerX = 50;
  const centerY = 50;
  
  // Position obstacle on tunnel wall
  const x = centerX + Math.cos(angle) * tunnelRadius;
  const y = centerY + Math.sin(angle) * tunnelRadius;
  
  // Scale obstacle based on depth (y position simulates depth)
  const depthScale = 0.5 + (obstacle.y / 100) * 0.5;
  const scaledSize = obstacle.size * depthScale;
  
  // Determine color based on size (inverted scoring visual cue)
  const getRockColor = () => {
    if (obstacle.obstacleType === 'small') {
      return 'from-yellow-400 to-orange-500'; // High value - bright colors
    } else if (obstacle.obstacleType === 'medium') {
      return 'from-orange-500 to-red-600'; // Medium value
    } else {
      return 'from-gray-600 to-gray-800'; // Low value - dark colors
    }
  };

  return (
    <div
      className={`absolute ${obstacle.isExploding ? 'animate-pulse' : ''}`}
      style={{
        width: `${scaledSize}%`,
        height: `${scaledSize}%`,
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        opacity: obstacle.isExploding ? "0.8" : "1",
        transition: "opacity 0.3s ease-out",
        zIndex: Math.floor((1 - obstacle.y / 100) * 100),
      }}
    >
      {!obstacle.isExploding ? (
        <div className="w-full h-full relative">
          {/* Rock with color indicating value */}
          <div 
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getRockColor()}`}
            style={{
              boxShadow: `0 0 ${scaledSize * 2}px rgba(255, 165, 0, 0.5)`,
            }}
          />
          
          {/* Texture details */}
          <div className="absolute inset-[20%] rounded-full bg-black/30" />
          <div className="absolute w-[30%] h-[30%] rounded-full bg-black/40"
               style={{top: "15%", left: "25%"}} />
          
          {/* Point value indicator for small rocks */}
          {obstacle.obstacleType === 'small' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-bold text-xs animate-pulse">
                {obstacle.points}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Explosion effect
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse" />
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping opacity-90" />
          <div className="absolute inset-2/5 rounded-full bg-white animate-pulse" />
          
          {/* Explosion fragments */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30);
            const distance = 40 + (i % 3) * 15;
            const fragmentSize = 2 + (i % 2);
            
            const xPos = 50 + distance * Math.cos(angle * Math.PI / 180);
            const yPos = 50 + distance * Math.sin(angle * Math.PI / 180);
            
            return (
              <div
                key={i}
                className="absolute rounded-full bg-orange-400 animate-ping"
                style={{
                  width: `${fragmentSize}%`,
                  height: `${fragmentSize}%`,
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  transform: "translate(-50%, -50%)",
                  animationDuration: "0.6s",
                  animationDelay: `${i * 0.02}s`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

TunnelObstacleItem.displayName = "TunnelObstacleItem";

const TunnelObstacles: React.FC<TunnelObstaclesProps> = memo(({ obstacles }) => {
  return (
    <div className="absolute inset-0">
      {obstacles.map((obstacle) => (
        <TunnelObstacleItem key={obstacle.id} obstacle={obstacle} />
      ))}
    </div>
  );
});

TunnelObstacles.displayName = "TunnelObstacles";

export default TunnelObstacles;
