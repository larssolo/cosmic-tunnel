
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
        // Optimized explosion effect with fewer DOM elements
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping"></div>
          <div className="absolute inset-2/5 rounded-full bg-white"></div>
          
          {/* Reduced number of explosion particles */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
              style={{
                top: `${50 + 30 * Math.sin(i * Math.PI / 2)}%`,
                left: `${50 + 30 * Math.cos(i * Math.PI / 2)}%`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
                animationDelay: `${Math.random() * 0.2}s`
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
