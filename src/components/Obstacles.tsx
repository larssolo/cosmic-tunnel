
import React, { memo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface ObstaclesProps {
  obstacles: Obstacle[];
}

// Memoize individual obstacles to prevent unnecessary re-renders
const ObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  return (
    <div
      className={`absolute rounded-full ${obstacle.isExploding ? 'animate-pulse' : ''}`}
      style={{
        width: `${obstacle.size}%`,
        height: `${obstacle.size}%`,
        left: `${obstacle.x}%`,
        top: `${obstacle.y}%`,
        transform: "translate(-50%, -50%)",
        opacity: obstacle.isExploding ? "0.8" : "1",
        transition: "opacity 0.3s ease-out"
      }}
    >
      {!obstacle.isExploding ? (
        // Normal asteroid with modern gradient
        <>
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(225deg, #7E69AB 0%, #1A1F2C 100%)",
              boxShadow: "0 0 15px rgba(126, 105, 171, 0.5)"
            }}
          ></div>
          <div className="absolute inset-2 rounded-full opacity-70"
               style={{background: "linear-gradient(45deg, #6E59A5 0%, #D6BCFA 100%)"}}></div>
          
          {/* Simplified surface details - reduce DOM elements */}
          <div className="absolute w-1/4 h-1/4 rounded-full bg-gray-700 opacity-80"
               style={{top: "20%", left: "30%"}}></div>
          <div className="absolute w-1/5 h-1/5 rounded-full bg-gray-800 opacity-70"
               style={{top: "60%", left: "70%"}}></div>
        </>
      ) : (
        // Enhanced explosion effect with more dramatic animation
        <div className="relative w-full h-full">
          {/* Core explosion */}
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping opacity-90"></div>
          <div className="absolute inset-2/5 rounded-full bg-white animate-pulse"></div>
          
          {/* Shockwave effect */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30"
               style={{animationDuration: "0.8s"}}></div>
          
          {/* Explosion particles - more particles and better animations */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-orange-400 rounded-full animate-ping"
              style={{
                width: `${Math.random() * 5 + 2}%`,
                height: `${Math.random() * 5 + 2}%`,
                top: `${50 + 45 * Math.sin(i * Math.PI / 4)}%`,
                left: `${50 + 45 * Math.cos(i * Math.PI / 4)}%`,
                animationDuration: `${0.3 + Math.random() * 0.7}s`,
                animationDelay: `${Math.random() * 0.2}s`,
                opacity: 0.8
              }}
            ></div>
          ))}
          
          {/* Flying debris */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={`debris-${i}`}
              className="absolute bg-gray-700 rounded-sm"
              style={{
                width: `${Math.random() * 6 + 3}%`,
                height: `${Math.random() * 3 + 1}%`,
                top: `${50 + 60 * Math.sin(i * Math.PI / 3)}%`,
                left: `${50 + 60 * Math.cos(i * Math.PI / 3)}%`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fade-out ${0.5 + Math.random() * 0.5}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.15}s`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
});

// Memoize the entire Obstacles component
const Obstacles: React.FC<ObstaclesProps> = memo(({ obstacles }) => {
  console.log('Rendering obstacles:', obstacles.length);
  return (
    <>
      {obstacles.map((obstacle) => (
        <ObstacleItem key={obstacle.id} obstacle={obstacle} />
      ))}
    </>
  );
});

export default Obstacles;
