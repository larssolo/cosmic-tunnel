import React, { memo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface TunnelObstaclesProps {
  obstacles: Obstacle[];
}

const TunnelObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  const angle = obstacle.angle || 0;
  const tunnelRadius = 35;
  const centerX = 50;
  const centerY = 50;
  
  const x = centerX + Math.cos(angle) * tunnelRadius;
  const y = centerY + Math.sin(angle) * tunnelRadius;
  
  const depthScale = 0.5 + (obstacle.y / 100) * 0.5;
  const scaledSize = obstacle.size * depthScale;
  
  // Cyber colors based on obstacle type
  const getCyberStyle = () => {
    if (obstacle.obstacleType === 'small') {
      return {
        borderColor: '#00ffff',
        shadowColor: '0 0 20px #00ffff, 0 0 40px #00ffff',
        bgGradient: 'linear-gradient(135deg, rgba(0,255,255,0.3), rgba(0,255,255,0.1))',
        glowColor: 'cyan'
      };
    } else if (obstacle.obstacleType === 'medium') {
      return {
        borderColor: '#ff00ff',
        shadowColor: '0 0 20px #ff00ff, 0 0 40px #ff00ff',
        bgGradient: 'linear-gradient(135deg, rgba(255,0,255,0.3), rgba(255,0,255,0.1))',
        glowColor: 'magenta'
      };
    } else {
      return {
        borderColor: '#ff0080',
        shadowColor: '0 0 15px #ff0080, 0 0 30px #ff0080',
        bgGradient: 'linear-gradient(135deg, rgba(255,0,128,0.3), rgba(255,0,128,0.1))',
        glowColor: '#ff0080'
      };
    }
  };

  const style = getCyberStyle();
  const rotation = (obstacle.id % 360) + obstacle.y * 2;
  const isGlitching = obstacle.id % 7 === 0;

  return (
    <div
      className={`absolute ${obstacle.isExploding ? '' : ''} ${isGlitching ? 'animate-pulse' : ''}`}
      style={{
        width: `${scaledSize}%`,
        height: `${scaledSize}%`,
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        opacity: obstacle.isExploding ? "0.8" : "1",
        transition: "opacity 0.3s ease-out",
        zIndex: Math.floor((1 - obstacle.y / 100) * 100),
      }}
    >
      {!obstacle.isExploding ? (
        <div className="w-full h-full relative">
          {/* Wireframe cube/diamond shape */}
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
          
          {/* Inner wireframe */}
          <div 
            className="absolute inset-[20%]"
            style={{
              border: `1px solid ${style.borderColor}`,
              opacity: 0.6,
              clipPath: obstacle.obstacleType === 'small' 
                ? 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
                : obstacle.obstacleType === 'medium'
                ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                : 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
            }}
          />
          
          {/* Glitch lines for some obstacles */}
          {isGlitching && (
            <>
              <div 
                className="absolute w-full h-[2px] top-1/3"
                style={{
                  background: style.glowColor,
                  transform: `translateX(${Math.sin(rotation) * 5}px)`,
                  opacity: 0.8
                }}
              />
              <div 
                className="absolute w-full h-[2px] top-2/3"
                style={{
                  background: style.glowColor,
                  transform: `translateX(${-Math.sin(rotation) * 3}px)`,
                  opacity: 0.6
                }}
              />
            </>
          )}
          
          {/* Point value indicator for small (high value) obstacles */}
          {obstacle.obstacleType === 'small' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="font-bold text-xs"
                style={{
                  color: '#00ffff',
                  textShadow: '0 0 10px #00ffff',
                  fontFamily: 'monospace'
                }}
              >
                {obstacle.points}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Cyber explosion effect
        <div className="relative w-full h-full">
          {/* Core explosion */}
          <div 
            className="absolute inset-0 animate-ping"
            style={{
              background: 'radial-gradient(circle, #00ffff, #ff00ff, transparent)',
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            }}
          />
          
          {/* Glitch fragments */}
          {Array.from({ length: 8 }).map((_, i) => {
            const fragmentAngle = (i * 45) * Math.PI / 180;
            const distance = 50 + (i % 3) * 20;
            const fragmentSize = 3 + (i % 2) * 2;
            
            const xPos = 50 + distance * Math.cos(fragmentAngle);
            const yPos = 50 + distance * Math.sin(fragmentAngle);
            
            return (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  width: `${fragmentSize}px`,
                  height: `${fragmentSize}px`,
                  left: `${xPos}%`,
                  top: `${yPos}%`,
                  transform: "translate(-50%, -50%)",
                  background: i % 2 === 0 ? '#00ffff' : '#ff00ff',
                  boxShadow: `0 0 10px ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}`,
                  animationDuration: "0.4s",
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            );
          })}
          
          {/* Digital noise effect */}
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.3) 2px,
                rgba(0, 255, 255, 0.3) 4px
              )`,
              mixBlendMode: 'screen'
            }}
          />
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