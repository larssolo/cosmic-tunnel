
import React, { memo } from "react";
import SpaceshipVessel from "./SpaceshipVessel";
import SpaceshipExplosion from "./SpaceshipExplosion";

interface SpaceshipProps {
  position: number;
  isExploding?: boolean;
  isInvulnerable?: boolean;
}

// Use memo to prevent unnecessary re-renders when props haven't changed
const Spaceship: React.FC<SpaceshipProps> = memo(({ 
  position, 
  isExploding = false, 
  isInvulnerable = false 
}) => {
  return (
    <div
      className="absolute w-16 h-16 transform -translate-x-1/2 cursor-pointer"
      style={{
        bottom: "20%",
        left: `${position}%`,
        willChange: "left",
        zIndex: 25,
      }}
    >
      {isExploding ? (
        <SpaceshipExplosion />
      ) : (
        <SpaceshipVessel isInvulnerable={isInvulnerable} />
      )}
    </div>
  );
});

export default Spaceship;
