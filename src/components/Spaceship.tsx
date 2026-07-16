
import React, { memo } from "react";
import SpaceshipVessel from "./SpaceshipVessel";
import SpaceshipExplosion from "./SpaceshipExplosion";

interface SpaceshipProps {
  position: number;
  vertical: number;
  isExploding?: boolean;
  isInvulnerable?: boolean;
}

// Use memo to prevent unnecessary re-renders when props haven't changed
const Spaceship: React.FC<SpaceshipProps> = memo(({ position, vertical, isExploding = false, isInvulnerable = false }) => {
  const prevPosRef = React.useRef(position);
  const [tilt, setTilt] = React.useState(0);
  const tiltResetRef = React.useRef<number | null>(null);

  const prevVertRef = React.useRef(vertical);
  const [thrust, setThrust] = React.useState(1);
  const thrustResetRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const delta = position - prevPosRef.current;
    prevPosRef.current = position;
    if (Math.abs(delta) > 0.05) {
      setTilt(Math.max(-18, Math.min(18, delta * 9)));
      if (tiltResetRef.current) window.clearTimeout(tiltResetRef.current);
      tiltResetRef.current = window.setTimeout(() => setTilt(0), 150);
    }
  }, [position]);

  // Flame reacts to vertical motion: flying up/forward (vertical decreases)
  // stretches the flame, diving down (vertical increases) shortens it.
  React.useEffect(() => {
    const vDelta = vertical - prevVertRef.current;
    prevVertRef.current = vertical;
    if (Math.abs(vDelta) > 0.05) {
      setThrust(Math.max(0.5, Math.min(1.85, 1 - vDelta * 0.14)));
      if (thrustResetRef.current) window.clearTimeout(thrustResetRef.current);
      thrustResetRef.current = window.setTimeout(() => setThrust(1), 140);
    }
  }, [vertical]);

  return (
    <div
      className="absolute w-16 h-16 cursor-pointer"
      style={{
        top: `${vertical}%`,
        left: `${position}%`,
        transform: `translate(-50%, -50%) rotate(${tilt}deg)`,
        transition: "transform 120ms ease-out",
        willChange: "left, top, transform",
        zIndex: isExploding ? 3 : 60,
      }}
    >
      {isExploding ? <SpaceshipExplosion /> : <SpaceshipVessel isInvulnerable={isInvulnerable} thrust={thrust} />}
    </div>
  );
});

export default Spaceship;
