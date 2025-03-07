
import React from "react";

interface Projectile {
  id: number;
  x: number;
  y: number;
}

interface ProjectilesProps {
  projectiles: Projectile[];
}

const Projectiles: React.FC<ProjectilesProps> = ({ projectiles }) => {
  return (
    <>
      {projectiles.map((projectile) => (
        <div
          key={projectile.id}
          className="absolute w-2 h-6 transform -translate-x-1/2"
          style={{
            left: `${projectile.x}%`,
            bottom: `${projectile.y}%`,
            background: "linear-gradient(180deg, #FFF500 0%, #F97316 100%)",
            boxShadow: "0 0 10px rgba(255, 245, 0, 0.8)",
            borderRadius: "2px"
          }}
        >
          {/* Projectile trail effect */}
          <div className="absolute -bottom-4 left-1/2 w-1 h-4 transform -translate-x-1/2 opacity-70"
               style={{background: "linear-gradient(180deg, #F97316 0%, transparent 100%)"}}></div>
        </div>
      ))}
    </>
  );
};

export default Projectiles;
