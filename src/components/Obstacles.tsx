
import React, { memo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface ObstaclesProps {
  obstacles: Obstacle[];
}

// Memoize individual obstacles to prevent unnecessary re-renders
const ObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  // Calculate size in vmin units for consistent proportions across devices
  const sizeStyle = obstacle.sizeVmin ? 
    { width: `${obstacle.sizeVmin}vmin`, height: `${obstacle.sizeVmin}vmin` } : 
    { width: `${obstacle.size || 10}%`, height: `${obstacle.size || 10}%` };

  return (
    <div
      className={`absolute rounded-full ${obstacle.isExploding ? 'animate-pulse' : ''}`}
      style={{
        ...sizeStyle,
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
        // Enhanced explosion effect with 40 fragments
        <div className="relative w-full h-full">
          {/* Core explosion */}
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping opacity-90"></div>
          <div className="absolute inset-2/5 rounded-full bg-white animate-pulse"></div>
          
          {/* Shockwave effect */}
          <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30"
               style={{animationDuration: "0.8s"}}></div>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-200 animate-ping opacity-20"
               style={{animationDuration: "1.2s"}}></div>
          
          {/* 40 explosion fragments with various speeds, sizes and directions */}
          {Array.from({ length: 40 }).map((_, i) => {
            // Distribute fragments in a circle with slightly random variations
            const angle = (i * 9) + (Math.random() * 8); // Slightly randomize angles (0-360 degrees)
            const distance = 35 + (Math.random() * 45); // Random distance from center (35-80% of radius)
            const fragmentSize = Math.random() * 4 + 1; // Size between 1-5% of parent
            const speed = 0.3 + Math.random() * 0.7; // Animation duration between 0.3-1s
            const delay = Math.random() * 0.2; // Random delay for more natural look
            
            // Calculate position based on angle and distance
            const xPos = 50 + distance * Math.cos(angle * Math.PI / 180);
            const yPos = 50 + distance * Math.sin(angle * Math.PI / 180);
            
            // Alternate between different fragment shapes and colors
            const fragmentType = i % 5;
            const colors = ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-red-500', 'bg-gray-700'];
            const color = colors[fragmentType];
            
            // Shapes: 0-2 = rounded, 3-4 = angular
            const shape = fragmentType < 3 ? 'rounded-full' : 'rounded-sm';
            
            return (
              <div 
                key={`fragment-${i}`}
                className={`absolute ${color} ${shape} animate-ping`}
                style={{
                  width: `${fragmentSize}%`,
                  height: `${fragmentSize}%`,
                  top: `${yPos}%`,
                  left: `${xPos}%`,
                  animationDuration: `${speed}s`,
                  animationDelay: `${delay}s`,
                  opacity: 0.8,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  boxShadow: fragmentType < 3 ? '0 0 3px rgba(255, 165, 0, 0.8)' : 'none'
                }}
              ></div>
            );
          })}
          
          {/* Flying larger debris pieces */}
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
