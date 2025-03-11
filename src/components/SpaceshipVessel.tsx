
import React, { memo } from "react";
import { Zap } from "lucide-react";

interface SpaceshipVesselProps {
  isInvulnerable: boolean;
}

// Memoize the component to prevent unnecessary re-renders
const SpaceshipVessel: React.FC<SpaceshipVesselProps> = memo(({ isInvulnerable }) => {
  return (
    <div className={`relative w-full h-full ${isInvulnerable ? 'animate-pulse opacity-80' : ''}`}>
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
      
      {/* Add shield effect when invulnerable */}
      {isInvulnerable && (
        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-70"
             style={{transform: "scale(1.2)"}}></div>
      )}
    </div>
  );
});

export default SpaceshipVessel;
