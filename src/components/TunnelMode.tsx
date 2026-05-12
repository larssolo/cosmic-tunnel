import React, { memo, useEffect, useRef } from "react";

const TunnelMode = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let offset = 0;
    let glitchIntensity = 0;
    let glitchTimer = 0;
    let animationId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Synthwave gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#0a0015");
      bgGradient.addColorStop(0.4, "#1a0030");
      bgGradient.addColorStop(0.6, "#2d0050");
      bgGradient.addColorStop(1, "#0a0015");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Retro sun in background
      const sunCenterX = canvas.width / 2;
      const sunCenterY = canvas.height * 0.35;
      const sunRadius = canvas.width * 0.25;

      // Sun gradient
      const sunGradient = ctx.createRadialGradient(
        sunCenterX, sunCenterY, 0,
        sunCenterX, sunCenterY, sunRadius
      );
      sunGradient.addColorStop(0, "#ff6b9d");
      sunGradient.addColorStop(0.3, "#ff4081");
      sunGradient.addColorStop(0.6, "#c2185b");
      sunGradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Horizontal lines through sun (retro effect)
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      for (let i = 0; i < 8; i++) {
        const y = sunCenterY - sunRadius * 0.3 + i * (sunRadius * 0.15);
        if (y > sunCenterY) {
          ctx.fillStyle = `rgba(0,0,0,${0.3 + i * 0.08})`;
          ctx.fillRect(sunCenterX - sunRadius, y, sunRadius * 2, 4 + i * 2);
        }
      }
      ctx.restore();

      // Neon grid floor (perspective)
      const horizonY = canvas.height * 0.55;
      const gridLines = 25;
      const gridSpeed = offset * 0.1;

      // Horizontal grid lines
      for (let i = 0; i < gridLines; i++) {
        const progress = ((i + gridSpeed) % gridLines) / gridLines;
        const y = horizonY + progress * progress * (canvas.height - horizonY);
        const alpha = progress * 0.8;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 1 + progress * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Glow effect
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Vertical grid lines (perspective)
      const numVertLines = 20;
      const vanishX = canvas.width / 2;
      
      for (let i = -numVertLines / 2; i <= numVertLines / 2; i++) {
        const bottomX = vanishX + i * (canvas.width / numVertLines) * 2;
        
        const gradient = ctx.createLinearGradient(vanishX, horizonY, bottomX, canvas.height);
        gradient.addColorStop(0, "rgba(255, 0, 128, 0)");
        gradient.addColorStop(0.3, "rgba(255, 0, 128, 0.3)");
        gradient.addColorStop(1, "rgba(255, 0, 128, 0.8)");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();

        // Glow
        ctx.shadowColor = "#ff0080";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Tunnel walls (hexagonal cyber effect)
      const tunnelSegments = 12;
      for (let i = 0; i < tunnelSegments; i++) {
        const z = ((i + offset * 0.5) % tunnelSegments) / tunnelSegments;
        const scale = 0.3 + z * 0.7;
        
        if (scale <= 0.1) continue;

        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.4;
        const radiusX = canvas.width * 0.45 * scale;
        const radiusY = canvas.height * 0.35 * scale;

        // Hexagonal frame
        ctx.save();
        ctx.translate(centerX, centerY);
        
        const sides = 6;
        const rotation = offset * 0.02 + i * 0.1;
        
        ctx.beginPath();
        for (let j = 0; j <= sides; j++) {
          const angle = (j / sides) * Math.PI * 2 + rotation;
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;
          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        
        // Alternating pink/cyan
        const color = i % 2 === 0 ? `rgba(0, 255, 255, ${0.1 + z * 0.4})` : `rgba(255, 0, 128, ${0.1 + z * 0.4})`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 + z * 3;
        
        ctx.shadowColor = i % 2 === 0 ? "#00ffff" : "#ff0080";
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }

      // Speed lines (particles rushing past)
      for (let i = 0; i < 30; i++) {
        const seed = i * 1234.5678;
        const baseX = (Math.sin(seed) * 0.5 + 0.5) * canvas.width;
        const baseY = ((offset * 10 + i * 50) % canvas.height);
        const length = 20 + (i % 5) * 10;
        
        const gradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY + length);
        const color = i % 3 === 0 ? "cyan" : i % 3 === 1 ? "magenta" : "white";
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, "transparent");
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 + (i % 2);
        ctx.globalAlpha = 0.4 + (i % 3) * 0.2;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX, baseY + length);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Glitch effect (occasional)
      glitchTimer++;
      if (glitchTimer > 120 && Math.random() > 0.98) {
        glitchIntensity = Math.random() * 20;
        glitchTimer = 0;
      }
      
      if (glitchIntensity > 0) {
        // Chromatic aberration / glitch bars
        const sliceHeight = 5 + Math.random() * 10;
        const sliceY = Math.random() * canvas.height;
        const offsetX = (Math.random() - 0.5) * glitchIntensity;
        
        const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceHeight);
        ctx.putImageData(imageData, offsetX, sliceY);
        
        glitchIntensity *= 0.9;
      }

      // Scanlines overlay
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.fillRect(0, y, canvas.width, 1);
      }

      // Vignette effect
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      vignetteGradient.addColorStop(0, "transparent");
      vignetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      offset += 0.8;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "crisp-edges" }}
    />
  );
});

TunnelMode.displayName = "TunnelMode";

export default TunnelMode;