
import React from "react";
import { Zap } from "lucide-react";

interface SpaceshipProps {
  position: number;
  onShoot: () => void;
  isExploding?: boolean;
}

const Spaceship: React.FC<SpaceshipProps> = ({ position, onShoot, isExploding = false }) => {
  return (
    <div
      className="absolute w-16 h-16 transform -translate-x-1/2 cursor-pointer"
      style={{
        bottom: "20%",
        left: `${position}%`,
      }}
      onClick={onShoot}
    >
      {isExploding ? (
        // Dramatically enhanced explosion effect
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
          
          {/* Explosion fragments - many more with varied directions, sizes, and colors */}
          {[...Array(40)].map((_, i) => {
            const angle = (i / 40) * 360;
            const distance = Math.random() * 150 + 30; // Much larger distance
            const size = Math.random() * 8 + 2;  // Larger fragments
            const speed = Math.random() * 1.5 + 1.5; // Slower for longer visible effect
            const delay = Math.random() * 0.3; // Stagger the fragments
            
            // Generate varied colors for the fragments
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
            
            // Randomly choose different fragment shapes
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
            const rotation = Math.random() * 1080; // Multiple full rotations
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
      ) : (
        // Regular spaceship design
        <div className="relative w-full h-full">
          {/* Main body with gradient */}
          <div 
            className="absolute top-0 left-1/2 w-6 h-12 transform -translate-x-1/2 rounded-t-2xl"
            style={{
              background: "linear-gradient(180deg, #33C3F0 0%, #0EA5E9 100%)",
            }}
          ></div>
          
          {/* Cockpit */}
          <div 
            className="absolute top-2 left-1/2 w-4 h-5 transform -translate-x-1/2 rounded-full"
            style={{
              background: "linear-gradient(180deg, #D6BCFA 0%, #9b87f5 100%)",
            }}
          ></div>
          
          {/* Wings */}
          <div className="absolute top-6 left-1/2 w-12 h-4 transform -translate-x-1/2 rounded-full"
               style={{background: "linear-gradient(90deg, #8B5CF6 0%, #0EA5E9 100%)"}}></div>
          
          {/* Engine section */}
          <div className="absolute bottom-0 left-1/2 w-10 h-6 transform -translate-x-1/2 rounded-b-lg"
               style={{background: "linear-gradient(180deg, #6E59A5 0%, #1A1F2C 100%)"}}></div>
          
          {/* Engine flames - animated */}
          <div className="absolute -bottom-2 left-1/2 w-6 h-5 transform -translate-x-1/2 rounded-b-full animate-pulse"
               style={{background: "linear-gradient(180deg, #F97316 0%, #FFA500 50%, #FF4500 100%)"}}></div>
          <div className="absolute -bottom-4 left-1/2 w-3 h-4 transform -translate-x-1/2 rounded-b-full animate-pulse"
               style={{background: "linear-gradient(180deg, #FF4500 0%, #FF0000 100%)"}}></div>
          
          {/* Weapon indicators */}
          <div className="absolute top-8 left-1 w-2 h-2 rounded-full bg-yellow-300"></div>
          <div className="absolute top-8 right-1 w-2 h-2 rounded-full bg-yellow-300"></div>
          
          {/* Shoot indicator */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-yellow-300 opacity-80">
            <Zap size={16} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Spaceship;
