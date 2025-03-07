
import React from "react";

interface Obstacle {
  id: number;
  x: number;
  y: number;
  size: number;
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
          className="absolute rounded-full bg-red-500"
          style={{
            width: `${obstacle.size}%`,
            height: `${obstacle.size}%`,
            left: `${obstacle.x}%`,
            top: `${obstacle.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Obstacle details */}
          <div className="absolute inset-1 rounded-full bg-red-600"></div>
          <div className="absolute inset-2 rounded-full bg-red-400 opacity-70"></div>
        </div>
      ))}
    </>
  );
};

export default Obstacles;
