
import React, { memo } from "react";

// Pre-generate random star positions for better performance
const generateStars = () => {
  return Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 5 === 0 ? "#D6BCFA" : i % 3 === 0 ? "#9b87f5" : "#fff",
    shadow: i % 5 === 0 ? "0 0 4px #D6BCFA" : "0 0 2px #fff",
    duration: Math.random() * 5 + 2,
    opacity: Math.random() * 0.8 + 0.2,
  }));
};

// Pre-generate tunnel rings for better performance
const generateTunnelRings = () => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    size: (i + 1) * 10,
    duration: 3 + i * 0.2,
    opacity: 1 - i * 0.1,
    color: `rgb(${155 - i * 10}, ${135 - i * 5}, ${245 - i * 15})`,
    shadow: `0 0 ${5 + i * 2}px rgba(155, 135, 245, ${0.5 - i * 0.05})`,
  }));
};

// Pre-generate flashes for better performance
const generateFlashes = () => {
  return Array.from({ length: 3 }).map((_, i) => ({
    id: i,
    size: Math.random() * 30 + 20,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 5,
    delay: Math.random() * 5,
  }));
};

// Memoize stars to prevent re-renders
const Stars = memo(() => {
  const stars = React.useMemo(() => generateStars(), []);
  
  return (
    <div className="absolute inset-0 opacity-90">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: star.color,
            boxShadow: star.shadow,
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
});

// Memoize tunnel rings
const TunnelRings = memo(() => {
  const rings = React.useMemo(() => generateTunnelRings(), []);
  
  return (
    <div className="absolute inset-0 perspective-[800px]">
      {rings.map((ring) => (
        <div
          key={ring.id}
          className="absolute left-1/2 top-1/2 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"
          style={{
            width: `${ring.size}%`,
            height: `${ring.size}%`,
            animationDuration: `${ring.duration}s`,
            opacity: ring.opacity,
            borderColor: ring.color,
            boxShadow: ring.shadow,
          }}
        />
      ))}
    </div>
  );
});

// Memoize flashes
const Flashes = memo(() => {
  const flashes = React.useMemo(() => generateFlashes(), []);
  
  return (
    <div className="absolute inset-0">
      {flashes.map((flash) => (
        <div
          key={flash.id}
          className="absolute rounded-full animate-pulse opacity-0"
          style={{
            width: `${flash.size}px`,
            height: `${flash.size}px`,
            background: "radial-gradient(circle, rgba(155, 135, 245, 0.7) 0%, transparent 70%)",
            left: `${flash.left}%`,
            top: `${flash.top}%`,
            animationDuration: `${flash.duration}s`,
            animationDelay: `${flash.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

// Memoize the entire Tunnel component
const Tunnel = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background nebula effect - static */}
      <div className="absolute inset-0 opacity-30"
           style={{
             background: "radial-gradient(circle at 50% 50%, rgba(155, 135, 245, 0.3) 0%, transparent 70%)"
           }}></div>
      
      {/* Dynamic elements - memoized */}
      <Stars />
      <TunnelRings />
      <Flashes />
    </div>
  );
});

export default Tunnel;
