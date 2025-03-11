
import React from "react";

const SpaceshipExplosion: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Core explosion - bright center */}
      <div className="absolute top-1/2 left-1/2 w-16 h-16 -mt-8 -ml-8 rounded-full bg-yellow-300 animate-pulse z-30"></div>
      
      {/* First explosion wave */}
      <div 
        className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 rounded-full animate-ping"
        style={{
          background: "radial-gradient(circle, rgba(255,165,0,0.9) 0%, rgba(255,69,0,0) 70%)",
          animationDuration: "0.8s"
        }}
      ></div>
      
      {/* Second explosion wave - larger and slower */}
      <div 
        className="absolute top-1/2 left-1/2 w-48 h-48 -mt-24 -ml-24 rounded-full animate-ping"
        style={{
          background: "radial-gradient(circle, rgba(255,69,0,0.8) 0%, rgba(255,0,0,0) 70%)",
          animationDuration: "1.2s"
        }}
      ></div>
      
      {/* Third explosion wave - largest and slowest */}
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 -mt-32 -ml-32 rounded-full animate-ping opacity-60"
        style={{
          background: "radial-gradient(circle, rgba(255,0,0,0.7) 0%, rgba(128,0,0,0) 70%)",
          animationDuration: "1.6s"
        }}
      ></div>
      
      {/* Fourth explosion wave - massive burst */}
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48 rounded-full animate-ping opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(255,105,180,0.6) 0%, rgba(128,0,128,0) 70%)",
          animationDuration: "2.0s"
        }}
      ></div>
      
      {/* Explosion fragments */}
      {[...Array(40)].map((_, i) => {
        const angle = (i / 40) * 360;
        const distance = Math.random() * 150 + 30;
        const size = Math.random() * 8 + 2;
        const speed = Math.random() * 1.5 + 1.5;
        const delay = Math.random() * 0.3;
        
        const colorOptions = [
          "#F97316", // Orange
          "#D946EF", // Magenta
          "#8B5CF6", // Purple
          "#EC4899", // Pink
          "#FACC15", // Yellow
          "#10B981", // Emerald
          "#FFFFFF"  // White
        ];
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        
        const shapes = ["rounded-full", "rounded-sm", "rounded"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        return (
          <div 
            key={i}
            className={`absolute top-1/2 left-1/2 ${shape}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
              animation: `explosion-fragment ${speed}s ease-out ${delay}s forwards`,
              boxShadow: `0 0 ${Math.random() * 8 + 2}px ${color}`
            }}
          ></div>
        );
      })}
      
      {/* Additional spinning metal fragments */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * 360;
        const distance = Math.random() * 120 + 40;
        const width = Math.random() * 12 + 4;
        const height = Math.random() * 6 + 2;
        const rotation = Math.random() * 1080;
        const speed = Math.random() * 2.5 + 2.0;
        const delay = Math.random() * 0.2;
        
        return (
          <div 
            key={`metal-${i}`}
            className="absolute top-1/2 left-1/2"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              background: `linear-gradient(90deg, #b0b0b0, #808080)`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px) rotate(${rotation}deg)`,
              animation: `explosion-fragment ${speed}s ease-out ${delay}s forwards`,
            }}
          ></div>
        );
      })}
      
      {/* Fire trails behind some fragments */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * 360;
        const distance = Math.random() * 120 + 30;
        const width = Math.random() * 20 + 10;
        const speed = Math.random() * 2.5 + 1.5;
        const delay = Math.random() * 0.2;
        
        return (
          <div 
            key={`trail-${i}`}
            className="absolute top-1/2 left-1/2"
            style={{
              width: `${width}px`,
              height: `${width / 2}px`,
              background: `linear-gradient(to right, rgba(255,69,0,0.8), rgba(255,165,0,0.5), transparent)`,
              borderRadius: '50% 0 0 50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
              animation: `explosion-fragment ${speed}s ease-out ${delay}s forwards`,
            }}
          ></div>
        );
      })}
      
      {/* Shockwave rings */}
      <div 
        className="absolute top-1/2 left-1/2 w-48 h-48 -mt-24 -ml-24 rounded-full border-4 border-orange-500 animate-ping opacity-80"
        style={{animationDuration: "1s"}}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 -mt-32 -ml-32 rounded-full border-4 border-red-500 animate-ping opacity-60"
        style={{animationDuration: "1.5s"}}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48 rounded-full border-4 border-yellow-500 animate-ping opacity-40"
        style={{animationDuration: "2s"}}
      ></div>
    </div>
  );
};

export default SpaceshipExplosion;
