
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
        // Dramatic explosion effect with multiple layers
        <div className="relative w-full h-full">
          {/* Core explosion - bright center */}
          <div className="absolute top-1/2 left-1/2 w-12 h-12 -mt-6 -ml-6 rounded-full bg-yellow-300 animate-pulse z-30"></div>
          
          {/* First explosion wave */}
          <div 
            className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 rounded-full animate-ping"
            style={{
              background: "radial-gradient(circle, rgba(255,165,0,0.8) 0%, rgba(255,69,0,0) 70%)",
              animationDuration: "0.8s"
            }}
          ></div>
          
          {/* Second explosion wave - larger and slower */}
          <div 
            className="absolute top-1/2 left-1/2 w-32 h-32 -mt-16 -ml-16 rounded-full animate-ping"
            style={{
              background: "radial-gradient(circle, rgba(255,69,0,0.6) 0%, rgba(255,0,0,0) 70%)",
              animationDuration: "1.2s"
            }}
          ></div>
          
          {/* Third explosion wave - largest and slowest */}
          <div 
            className="absolute top-1/2 left-1/2 w-48 h-48 -mt-24 -ml-24 rounded-full animate-ping opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(255,0,0,0.5) 0%, rgba(128,0,0,0) 70%)",
              animationDuration: "1.6s"
            }}
          ></div>
          
          {/* Explosion particles - random directions */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * 360;
            const distance = Math.random() * 30 + 15;
            const size = Math.random() * 5 + 2;
            const speed = Math.random() * 0.8 + 0.6;
            const hue = Math.floor(Math.random() * 60);
            
            return (
              <div 
                key={i}
                className="absolute top-1/2 left-1/2 rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `hsl(${hue}, 100%, 50%)`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${distance}px)`,
                  animation: `explosion-particle ${speed}s ease-out forwards`
                }}
              ></div>
            );
          })}
          
          {/* Shockwave ring */}
          <div 
            className="absolute top-1/2 left-1/2 w-40 h-40 -mt-20 -ml-20 rounded-full border-4 border-orange-500 animate-ping opacity-70"
            style={{animationDuration: "1s"}}
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
