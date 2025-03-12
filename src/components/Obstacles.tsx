
import React, { memo, useMemo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface ObstaclesProps {
  obstacles: Obstacle[];
}

// Memoize individual obstacles to prevent unnecessary re-renders
const ObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  // Calculate size in vmin units for consistent proportions across devices
  const sizeStyle = useMemo(() => {
    return obstacle.sizeVmin ? 
      { width: `${obstacle.sizeVmin}vmin`, height: `${obstacle.sizeVmin}vmin` } : 
      { width: `${obstacle.size || 10}%`, height: `${obstacle.size || 10}%` };
  }, [obstacle.size, obstacle.sizeVmin]);

  // For exploding obstacles, memoize the fragment array to prevent re-creation on each render
  const explosionFragments = useMemo(() => {
    if (!obstacle.isExploding) return null;
    
    return Array.from({ length: 40 }).map((_, i) => {
      // Distribute fragments in a circle with slightly random variations
      const angle = (i * 9) + (Math.random() * 8);
      const distance = 35 + (Math.random() * 45);
      const fragmentSize = Math.random() * 4 + 1;
      const speed = 0.3 + Math.random() * 0.7;
      const delay = Math.random() * 0.2;
      
      // Calculate position based on angle and distance
      const xPos = 50 + distance * Math.cos(angle * Math.PI / 180);
      const yPos = 50 + distance * Math.sin(angle * Math.PI / 180);
      
      // Alternate between different fragment shapes and colors
      const fragmentType = i % 5;
      const colors = ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-red-500', 'bg-gray-700'];
      const color = colors[fragmentType];
      
      // Shapes: 0-2 = rounded, 3-4 = angular
      const shape = fragmentType < 3 ? 'rounded-full' : 'rounded-sm';
      
      return { i, xPos, yPos, fragmentSize, speed, delay, color, shape, fragmentType };
    });
  }, [obstacle.isExploding]);

  // Memoize debris pieces
  const debrisPieces = useMemo(() => {
    if (!obstacle.isExploding) return null;
    
    return Array.from({ length: 6 }).map((_, i) => {
      const width = Math.random() * 6 + 3;
      const height = Math.random() * 3 + 1;
      const top = 50 + 60 * Math.sin(i * Math.PI / 3);
      const left = 50 + 60 * Math.cos(i * Math.PI / 3);
      const rotation = Math.random() * 360;
      const duration = 0.5 + Math.random() * 0.5;
      const delay = Math.random() * 0.15;
      
      return { i, width, height, top, left, rotation, duration, delay };
    });
  }, [obstacle.isExploding]);

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
        // Enhanced explosion effect with optimized fragments
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
          
          {/* Explosion fragments with memoized values */}
          {explosionFragments && explosionFragments.map(fragment => (
            <div 
              key={`fragment-${fragment.i}`}
              className={`absolute ${fragment.color} ${fragment.shape} animate-ping`}
              style={{
                width: `${fragment.fragmentSize}%`,
                height: `${fragment.fragmentSize}%`,
                top: `${fragment.yPos}%`,
                left: `${fragment.xPos}%`,
                animationDuration: `${fragment.speed}s`,
                animationDelay: `${fragment.delay}s`,
                opacity: 0.8,
                transform: `rotate(${Math.random() * 360}deg)`,
                boxShadow: fragment.fragmentType < 3 ? '0 0 3px rgba(255, 165, 0, 0.8)' : 'none'
              }}
            ></div>
          ))}
          
          {/* Flying larger debris pieces */}
          {debrisPieces && debrisPieces.map(debris => (
            <div 
              key={`debris-${debris.i}`}
              className="absolute bg-gray-700 rounded-sm"
              style={{
                width: `${debris.width}%`,
                height: `${debris.height}%`,
                top: `${debris.top}%`,
                left: `${debris.left}%`,
                transform: `rotate(${debris.rotation}deg)`,
                animation: `fade-out ${debris.duration}s ease-out forwards`,
                animationDelay: `${debris.delay}s`,
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
  return (
    <>
      {obstacles.map((obstacle) => (
        <ObstacleItem key={obstacle.id} obstacle={obstacle} />
      ))}
    </>
  );
});

export default Obstacles;
