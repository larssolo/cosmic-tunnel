import React, { memo, useMemo } from "react";

interface TunnelTransitionProps {
  isActive: boolean;
}

export const TunnelTransition = memo(({ isActive }: TunnelTransitionProps) => {
  // Generate random particles for debris effect
  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 0.8 + 0.4,
      delay: Math.random() * 0.5,
      startX: Math.random() * 100,
      angle: (Math.random() - 0.5) * 60,
      color: i % 3 === 0 ? '#00ffff' : i % 3 === 1 ? '#ff00ff' : '#ff0080'
    }));
  }, []);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Dark overlay with gradient */}
      <div 
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(26, 0, 48, 0.8), rgba(10, 0, 21, 0.95))'
        }}
      />
      
      {/* Grid lines rushing toward viewer */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`grid-${i}`}
            className="absolute left-0 right-0 h-[2px]"
            style={{
              top: `${(i / 15) * 100}%`,
              background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? '#00ffff' : '#ff00ff'}, transparent)`,
              animation: `fly-past ${0.3 + i * 0.05}s linear ${i * 0.02}s forwards`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* Debris particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size * 3}px`,
              left: `${particle.startX}%`,
              top: '-10%',
              background: `linear-gradient(to bottom, transparent, ${particle.color}, transparent)`,
              boxShadow: `0 0 10px ${particle.color}`,
              transform: `rotate(${particle.angle}deg)`,
              animation: `fly-past ${particle.duration}s linear ${particle.delay}s forwards`,
            }}
          />
        ))}
      </div>
      
      {/* Main text */}
      <div className="text-center relative z-10">
        {/* Glitch effect layers */}
        <h1 
          className="text-5xl md:text-7xl font-bold mb-4 tracking-widest"
          style={{
            fontFamily: 'monospace',
            color: '#00ffff',
            textShadow: `
              0 0 10px #00ffff,
              0 0 20px #00ffff,
              0 0 40px #00ffff,
              3px 0 0 #ff00ff,
              -3px 0 0 #ff0080
            `,
            animation: 'glitch-text 0.3s infinite'
          }}
        >
          ENTERING
        </h1>
        <h2 
          className="text-6xl md:text-8xl font-bold tracking-wider"
          style={{
            fontFamily: 'monospace',
            color: '#ff00ff',
            textShadow: `
              0 0 10px #ff00ff,
              0 0 30px #ff00ff,
              0 0 60px #ff00ff,
              -3px 0 0 #00ffff,
              3px 0 0 #ff0080
            `,
            animation: 'glitch-text 0.2s infinite reverse'
          }}
        >
          CYBER WORMHOLE
        </h2>
        
        {/* Animated underline */}
        <div className="mt-6 flex justify-center gap-2">
          <div 
            className="h-1 animate-pulse"
            style={{
              width: '100px',
              background: 'linear-gradient(90deg, transparent, #00ffff, #ff00ff)',
              boxShadow: '0 0 20px #00ffff'
            }}
          />
          <div 
            className="h-1 animate-pulse"
            style={{
              width: '100px',
              background: 'linear-gradient(90deg, #ff00ff, #00ffff, transparent)',
              boxShadow: '0 0 20px #ff00ff',
              animationDelay: '0.1s'
            }}
          />
        </div>
        
        {/* Warning text */}
        <p 
          className="mt-4 text-sm tracking-[0.3em] animate-pulse"
          style={{
            color: '#ff0080',
            fontFamily: 'monospace',
            textShadow: '0 0 10px #ff0080'
          }}
        >
          [ DIMENSIONAL SHIFT DETECTED ]
        </p>
      </div>
      
      {/* Corner brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-cyan-400 opacity-80" style={{ boxShadow: '0 0 15px #00ffff' }} />
      <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-pink-500 opacity-80" style={{ boxShadow: '0 0 15px #ff00ff' }} />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-pink-500 opacity-80" style={{ boxShadow: '0 0 15px #ff00ff' }} />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-cyan-400 opacity-80" style={{ boxShadow: '0 0 15px #00ffff' }} />
    </div>
  );
});

TunnelTransition.displayName = "TunnelTransition";