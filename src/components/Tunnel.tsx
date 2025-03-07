
import React from "react";

const Tunnel = () => {
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Tunnel stars effect */}
      <div className="absolute inset-0 opacity-70">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Tunnel rings effect */}
      <div className="absolute inset-0 perspective-[800px]">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 border-2 border-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{
              width: `${(i + 1) * 10}%`,
              height: `${(i + 1) * 10}%`,
              animationDuration: `${3 + i * 0.2}s`,
              opacity: 1 - i * 0.1,
              borderColor: `rgb(${59 + i * 20}, ${130 - i * 10}, ${246 - i * 20})`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Tunnel;
