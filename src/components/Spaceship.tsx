
import React from "react";

interface SpaceshipProps {
  position: number;
}

const Spaceship: React.FC<SpaceshipProps> = ({ position }) => {
  return (
    <div
      className="absolute w-16 h-16 transform -translate-x-1/2"
      style={{
        bottom: "20%",
        left: `${position}%`,
      }}
    >
      {/* Spaceship body */}
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-1/2 w-4 h-12 bg-gray-300 transform -translate-x-1/2 rounded-t-full"></div>
        <div className="absolute bottom-0 left-1/2 w-10 h-6 bg-blue-500 transform -translate-x-1/2 rounded-b-lg"></div>
        <div className="absolute bottom-0 left-1/2 w-16 h-4 bg-gray-400 transform -translate-x-1/2 rounded-full"></div>
        
        {/* Engine flames */}
        <div className="absolute -bottom-2 left-1/2 w-8 h-4 bg-orange-500 transform -translate-x-1/2 rounded-b-full animate-pulse"></div>
        <div className="absolute -bottom-4 left-1/2 w-4 h-4 bg-red-500 transform -translate-x-1/2 rounded-b-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default Spaceship;
