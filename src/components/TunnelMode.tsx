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
    let animationId = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#080010");
      bgGradient.addColorStop(0.5, "#120020");
      bgGradient.addColorStop(1, "#080010");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Retro sun — smaller and more transparent
      const sunCenterX = canvas.width / 2;
      const sunCenterY = canvas.height * 0.3;
      const sunRadius = canvas.width * 0.15;

      const sunGradient = ctx.createRadialGradient(
        sunCenterX, sunCenterY, 0,
        sunCenterX, sunCenterY, sunRadius
      );
      sunGradient.addColorStop(0, "rgba(255, 107, 157, 0.5)");
      sunGradient.addColorStop(0.5, "rgba(255, 64, 129, 0.3)");
      sunGradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(sunCenterX, sunCenterY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.fill();

      // Neon grid floor
      const horizonY = canvas.height * 0.6;
      const gridLines = 18;
      const gridSpeed = offset * 0.08;

      for (let i = 0; i < gridLines; i++) {
        const progress = ((i + gridSpeed) % gridLines) / gridLines;
        const y = horizonY + progress * progress * (canvas.height - horizonY);
        const alpha = progress * 0.5;

        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 0.5 + progress * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      const numVertLines = 14;
      const vanishX = canvas.width / 2;

      for (let i = -numVertLines / 2; i <= numVertLines / 2; i++) {
        const bottomX = vanishX + i * (canvas.width / numVertLines) * 2;

        const gradient = ctx.createLinearGradient(vanishX, horizonY, bottomX, canvas.height);
        gradient.addColorStop(0, "rgba(255, 0, 128, 0)");
        gradient.addColorStop(0.4, "rgba(255, 0, 128, 0.15)");
        gradient.addColorStop(1, "rgba(255, 0, 128, 0.45)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizonY);
        ctx.lineTo(bottomX, canvas.height);
        ctx.stroke();
      }

      // Tunnel rings — fewer, more transparent
      const tunnelSegments = 8;
      for (let i = 0; i < tunnelSegments; i++) {
        const z = ((i + offset * 0.4) % tunnelSegments) / tunnelSegments;
        const scale = 0.3 + z * 0.7;
        if (scale <= 0.15) continue;

        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.42;
        const radiusX = canvas.width * 0.4 * scale;
        const radiusY = canvas.height * 0.3 * scale;

        ctx.save();
        ctx.translate(centerX, centerY);

        const sides = 6;
        const rotation = offset * 0.015 + i * 0.1;

        ctx.beginPath();
        for (let j = 0; j <= sides; j++) {
          const angle = (j / sides) * Math.PI * 2 + rotation;
          const x = Math.cos(angle) * radiusX;
          const y = Math.sin(angle) * radiusY;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const alpha = 0.08 + z * 0.2;
        ctx.strokeStyle = i % 2 === 0 ? `rgba(0, 255, 255, ${alpha})` : `rgba(255, 0, 128, ${alpha})`;
        ctx.lineWidth = 1 + z * 2;
        ctx.stroke();

        ctx.restore();
      }

      // Subtle speed lines — fewer, dimmer
      for (let i = 0; i < 15; i++) {
        const seed = i * 1234.5678;
        const baseX = (Math.sin(seed) * 0.5 + 0.5) * canvas.width;
        const baseY = ((offset * 8 + i * 60) % canvas.height);
        const length = 15 + (i % 4) * 8;

        const gradient = ctx.createLinearGradient(baseX, baseY, baseX, baseY + length);
        const color = i % 2 === 0 ? "cyan" : "magenta";
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, "transparent");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15 + (i % 3) * 0.07;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(baseX, baseY + length);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Light vignette so bottom area (where ship is) stays dark and clear
      const vignetteGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.4, canvas.width * 0.2,
        canvas.width / 2, canvas.height * 0.4, canvas.width * 0.8
      );
      vignetteGradient.addColorStop(0, "transparent");
      vignetteGradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      offset += 0.6;
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
