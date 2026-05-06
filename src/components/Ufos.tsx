import React, { memo } from "react";
import { Ufo, UfoBullet } from "@/types/gameTypes";

interface UfosProps {
  ufos: Ufo[];
  bullets: UfoBullet[];
}

const UfoSprite = memo(({ ufo }: { ufo: Ufo }) => {
  const y = ufo.baseY + Math.sin(ufo.phase) * 6;
  return (
    <div
      className="absolute"
      style={{
        width: `${ufo.size}%`,
        aspectRatio: "2 / 1",
        left: `${ufo.x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 5,
      }}
    >
      {!ufo.isExploding ? (
        <div className="relative w-full h-full">
          {/* Dome */}
          <div
            className="absolute"
            style={{
              left: "30%",
              right: "30%",
              top: 0,
              height: "55%",
              borderRadius: "50% 50% 0 0",
              background: "radial-gradient(ellipse at 50% 80%, #ff66ff 0%, #aa00aa 100%)",
              boxShadow: "0 0 12px #ff00ff",
            }}
          />
          {/* Saucer disc */}
          <div
            className="absolute"
            style={{
              left: 0,
              right: 0,
              top: "45%",
              height: "45%",
              borderRadius: "50%",
              background: "linear-gradient(180deg, #00ff88 0%, #008844 60%, #003322 100%)",
              boxShadow: "0 0 18px #00ff88",
            }}
          />
          {/* Underglow lights */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: "12%",
                aspectRatio: "1 / 1",
                left: `${15 + i * 18}%`,
                top: "75%",
                background: i % 2 === 0 ? "#ffff00" : "#00ffff",
                boxShadow: `0 0 6px ${i % 2 === 0 ? "#ffff00" : "#00ffff"}`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-yellow-300 animate-ping" style={{ boxShadow: "0 0 40px #ffff00" }} />
          <div className="absolute inset-1/4 rounded-full bg-orange-500 animate-pulse" />
        </div>
      )}
    </div>
  );
});
UfoSprite.displayName = "UfoSprite";

const Ufos: React.FC<UfosProps> = memo(({ ufos, bullets }) => {
  return (
    <>
      {ufos.map((u) => (
        <UfoSprite key={u.id} ufo={u} />
      ))}
      {bullets.map((b) => (
        <div
          key={b.id}
          className="absolute"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: "1.6%",
            height: "3.5%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(to bottom, #ffffff, #ff0066)",
            boxShadow: "0 0 8px #ff0066, 0 0 16px #ff0066",
            zIndex: 5,
          }}
        />
      ))}
    </>
  );
});
Ufos.displayName = "Ufos";

export default Ufos;
