
import React from "react";
import SpaceshipVessel from "./SpaceshipVessel";
import SpaceshipExplosion from "./SpaceshipExplosion";

interface SpaceshipProps {
  position: number;
  onShoot: () => void;
  isExploding?: boolean;
  isInvulnerable?: boolean;
}

const Spaceship: React.FC<SpaceshipProps> = ({ 
  position, 
  onShoot, 
  isExploding = false, 
  isInvulnerable = false 
}) => {
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
        <SpaceshipExplosion />
      ) : (
        <SpaceshipVessel isInvulnerable={isInvulnerable} />
      )}
    </div>
  );
};

export default Spaceship;
