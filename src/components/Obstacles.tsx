import React, { memo, useMemo } from "react";
import { Obstacle } from "@/types/gameTypes";

interface ObstaclesProps {
  obstacles: Obstacle[];
}

const ObstacleItem = memo(({ obstacle }: { obstacle: Obstacle }) => {
  const sizeStyle = useMemo(() => {
    return obstacle.sizeVmin ? 
      { width: `${obstacle.sizeVmin}vmin`, height: `${obstacle.sizeVmin}vmin` } : 
      { width: `${obstacle.size || 10}%`, height: `${obstacle.size || 10}%` };
  }, [obstacle.size, obstacle.sizeVmin]);

  const explosionFragments = useMemo(() => {
    if (!obstacle.isExploding) return null;
    
    return Array.from({ length: 40 }).map((_, i) => {
      const angle = (i * 9) + (Math.random() * 8);
      const distance = 35 + (Math.random() * 45);
      const fragmentSize = Math.random() * 4 + 1;
      const speed = 0.3 + Math.random() * 0.7;
      const delay = Math.random() * 0.2;
      
      const xPos = 50 + distance * Math.cos(angle * Math.PI / 180);
      const yPos = 50 + distance * Math.sin(angle * Math.PI / 180);
      
      const fragmentType = i % 5;
      const colors = ['bg-orange-600', 'bg-orange-400', 'bg-yellow-500', 'bg-red-500', 'bg-gray-700'];
      const color = colors[fragmentType];
      
      const shape = fragmentType < 3 ? 'rounded-full' : 'rounded-sm';
      
      return { i, xPos, yPos, fragmentSize, speed, delay, color, shape, fragmentType };
    });
  }, [obstacle.isExploding]);

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
        zIndex: 20,
        transition: "opacity 0.3s ease-out, transform 0.3s ease-out"
      }}
    >
      {!obstacle.isExploding ? (
        <>
          <div 
            className="absolute inset-0 rounded-full bg-slate-700"
            style={{
              background: "radial-gradient(circle at 30% 30%, #9A8FC7 0%, #4A3C78 30%, #1A1F2C 100%)",
              boxShadow: "0 0 30px rgba(126, 105, 171, 0.9)"
            }}
          ></div>
          <div 
            className="absolute inset-1 rounded-full opacity-90"
            style={{
              background: "radial-gradient(circle at 70% 70%, #6E59A5 10%, #D6BCFA 90%)",
              boxShadow: "inset 0 0 15px rgba(214, 188, 250, 0.6)"
            }}
          ></div>
          
          <div className="absolute w-2/5 h-2/5 rounded-full bg-gray-700 opacity-80"
               style={{top: "15%", left: "25%"}}></div>
          <div className="absolute w-1/3 h-1/3 rounded-full bg-gray-800 opacity-90"
               style={{top: "55%", left: "65%"}}></div>
          <div className="absolute w-1/4 h-1/4 rounded-full bg-gray-600 opacity-70"
               style={{top: "40%", left: "20%"}}></div>
        </>
      ) : (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse"></div>
          <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping opacity-90"></div>
          <div className="absolute inset-2/5 rounded-full bg-white animate-pulse"></div>
          
          <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-ping opacity-30"
               style={{animationDuration: "0.8s"}}></div>
          <div className="absolute inset-0 rounded-full border-2 border-yellow-200 animate-ping opacity-20"
               style={{animationDuration: "1.2s"}}></div>
          
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
