import React, { memo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface TunnelObstaclesProps {
  obstacles: Obstacle[];
}

const TunnelObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  // In tunnel mode, obstacles come down from top toward player
  // x is the actual horizontal position (20-80%)
  // y is vertical position (starts at -10, moves down to ~85 where ship is)
  
  // Scale effect - obstacles get larger as they approach (depth illusion)
  const depthProgress = Math.max(0, Math.min(1, (obstacle.y + 10) / 95)); // 0 at top, 1 near ship
  const depthScale = 0.4 + depthProgress * 0.8; // Scale from 0.4x to 1.2x
  const scaledSize = obstacle.size * depthScale;
  
  // Cyber colors based on obstacle type
  const getCyberStyle = () => {
    if (obstacle.obstacleType === 'small') {
      return {
        borderColor: '#00ffff',
        shadowColor: '0 0 20px #00ffff, 0 0 40px #00ffff',
        bgGradient: 'linear-gradient(135deg, rgba(0,255,255,0.4), rgba(0,255,255,0.15))',
        glowColor: 'cyan'
      };
    } else if (obstacle.obstacleType === 'medium') {
      return {
        borderColor: '#ff00ff',
        shadowColor: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
        bgGradient: 'linear-gradient(135deg, rgba(255,0,255,0.4), rgba(255,0,255,0.15))',
        glowColor: 'magenta'
      };
    } else {
      return {
        borderColor: '#ff0080',
        shadowColor: '0 0 15px #ff0080, 0 0 30px #ff0080',
        bgGradient: 'linear-gradient(135deg, rgba(255,0,128,0.4), rgba(255,0,128,0.15))',
        glowColor: '#ff0080'
      };
    }
  };

  const style = getCyberStyle();
  const rotation = (obstacle.angle || 0) * (180 / Math.PI) + obstacle.y * 2;
  const isGlitching = obstacle.id % 5 === 0;

  return (
    <div
      className={`absolute ${isGlitching ? 'animate-pulse' : ''}`}
      style={{
        width: `${scaledSize}%`,
        height: `${scaledSize}%`,
        left: `${obstacle.x}%`,
        top: `${obstacle.y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: obstacle.isExploding ? 0.7 : 0.9 + depthProgress * 0.1,
        transition: "opacity 0.2s ease-out",
        zIndex: Math.floor(depthProgress * 100),
      }}
    >
      {!obstacle.isExploding ? (
        <div className="w-full h-full relative">
          {/* Wireframe shape based on type */}
          <div 
            className="absolute inset-0"
            style={{
              background: style.bgGradient,
              border: `2px solid ${style.borderColor}`,
              boxShadow: style.shadowColor,
              clipPath: obstacle.obstacleType === 'small' 
                ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' // Diamond
                : obstacle.obstacleType === 'medium'
                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' // Hexagon
                : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' // Octagon
            }}
          />
          
          {/* Inner wireframe glow */}
          <div 
            className="absolute inset-[25%]"
            style={{
              border: `1px solid ${style.borderColor}`,
              opacity: 0.5,
              clipPath: obstacle.obstacleType === 'small' 
                ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                : obstacle.obstacleType === 'medium'
                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
          
          {/* Glitch scanlines */}
          {isGlitching && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 3px,
                  ${style.glowColor}33 3px,
                  ${style.glowColor}33 6px
                )`,
                opacity: 0.5
              }}
            />
          )}
          
          {/* Point value for small (high value) obstacles */}
          {obstacle.obstacleType === 'small' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="font-bold text-xs"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 8px #00ffff',
                  fontFamily: 'monospace',
                  fontSize: `${Math.max(8, scaledSize * 1.5)}px`
                }}
              >
                {obstacle.points}
              </span>
            </div>
          )}
        </div>
      ) : (
        // Cyber explosion effect
        <div className="relative w-full h-full">
          {/* Explosion core */}
          <div 
            className="absolute inset-0 animate-ping"
            style={{
              background: 'radial-gradient(circle, #ffffff, #00ffff, #ff00ff, transparent)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              opacity: 0.8
            }}
          />
          
          {/* Glitch fragments flying out */}
          {Array.from({ length: 6 }).map((_, i) => {
            const fragmentAngle = (i * 60) * Math.PI / 180;
            const distance = 40 + (i % 2) * 20;
            
            return (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  width: '4px',
                  height: '8px',
                  left: `${50 + distance * Math.cos(fragmentAngle)}%`,
                  top: `${50 + distance * Math.sin(fragmentAngle)}%`,
                  transform: 'translate(-50%, -50%)',
                  background: i % 2 === 0 ? '#00ffff' : '#ff00ff',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}`,
                  animationDuration: '0.3s',
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
    <div className="absolute inset-0 overflow-hidden">
      {obstacles.map((obstacle) => (
        <TunnelObstacleItem key={obstacle.id} obstacle={obstacle} />
      ))}
    </div>
  );
});

TunnelObstacles.displayName = "TunnelObstacles";

export default TunnelObstacles;