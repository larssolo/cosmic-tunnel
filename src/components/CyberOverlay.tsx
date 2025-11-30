import React, { memo } from "react";

interface CyberOverlayProps {
  isActive: boolean;
}

export const CyberOverlay = memo(({ isActive }: CyberOverlayProps) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Scanlines */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.4) 2px,
            rgba(0, 0, 0, 0.4) 4px
          )`,
        }}
      />
      
      {/* CRT curvature vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 60%,
            rgba(0, 0, 0, 0.4) 100%
          )`,
        }}
      />
      
      {/* Chromatic aberration edges */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          boxShadow: `
            inset 3px 0 10px rgba(255, 0, 128, 0.3),
            inset -3px 0 10px rgba(0, 255, 255, 0.3)
          `,
        }}
      />
      
      {/* Corner decorations */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-cyan-400 opacity-60" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-pink-400 opacity-60" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-pink-400 opacity-60" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-cyan-400 opacity-60" />
      
      {/* Top HUD line */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent)',
        }}
      />
      
      {/* Bottom HUD line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent)',
        }}
      />
    </div>
  );
});

CyberOverlay.displayName = "CyberOverlay";