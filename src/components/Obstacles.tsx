
import React from "react";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
  isExploding?: boolean;
}

interface ObstaclesProps {
  obstacles: Obstacle[];
}

const Obstacles: React.FC<ObstaclesProps> = ({ obstacles }) => {
  return (
    <>
      {obstacles.map((obstacle) => (
        <div
          key={obstacle.id}
          className={`absolute rounded-full ${obstacle.isExploding ? 'animate-ping' : ''}`}
          style={{
            width: `${obstacle.size}%`,
            height: `${obstacle.size}%`,
            left: `${obstacle.x}%`,
            top: `${obstacle.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: obstacle.isExploding ? "0.8" : "1",
            transition: "all 0.3s ease-out"
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
              
              {/* Surface details */}
              <div className="absolute w-1/4 h-1/4 rounded-full bg-gray-700 opacity-80"
                   style={{top: "20%", left: "30%"}}></div>
              <div className="absolute w-1/5 h-1/5 rounded-full bg-gray-800 opacity-70"
                   style={{top: "60%", left: "70%"}}></div>
            </>
          ) : (
            // Explosion effect
            <div className="relative w-full h-full">
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse"></div>
              <div className="absolute inset-1/4 rounded-full bg-yellow-400 animate-ping"></div>
              <div className="absolute inset-2/5 rounded-full bg-white"></div>
              
              {/* Explosion particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-orange-400 rounded-full animate-ping"
                  style={{
                    top: `${50 + 30 * Math.sin(i * Math.PI / 4)}%`,
                    left: `${50 + 30 * Math.cos(i * Math.PI / 4)}%`,
                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                    animationDelay: `${Math.random() * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Obstacles;
