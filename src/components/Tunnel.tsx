
import React from "react";

const Tunnel = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Background nebula effect */}
      <div className="absolute inset-0 opacity-30"
           style={{
             background: "radial-gradient(circle at 50% 50%, rgba(155, 135, 245, 0.3) 0%, transparent 70%)"
           }}></div>
             
      {/* Dynamic stars effect */}
      <div className="absolute inset-0 opacity-90">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              background: i % 5 === 0 ? "#D6BCFA" : i % 3 === 0 ? "#9b87f5" : "#fff",
              boxShadow: i % 5 === 0 ? "0 0 4px #D6BCFA" : "0 0 2px #fff",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 2}s`,
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
            className="absolute left-1/2 top-1/2 border-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{
              width: `${(i + 1) * 10}%`,
              height: `${(i + 1) * 10}%`,
              animationDuration: `${3 + i * 0.2}s`,
              opacity: 1 - i * 0.1,
              borderColor: `rgb(${155 - i * 10}, ${135 - i * 5}, ${245 - i * 15})`,
              boxShadow: `0 0 ${5 + i * 2}px rgba(155, 135, 245, ${0.5 - i * 0.05})`,
            }}
          />
        ))}
      </div>
      
      {/* Occasional distant flashes */}
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse opacity-0"
            style={{
              width: `${Math.random() * 30 + 20}px`,
              height: `${Math.random() * 30 + 20}px`,
              background: "radial-gradient(circle, rgba(155, 135, 245, 0.7) 0%, transparent 70%)",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 10 + 5}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Tunnel;
