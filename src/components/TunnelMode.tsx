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

    // Tunnel animation parameters
    let offset = 0;
    const tunnelDepth = 20;
    const segments = 30;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark background gradient (meteor interior)
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      bgGradient.addColorStop(0, "#3a2a4a");
      bgGradient.addColorStop(1, "#1a0f2e");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw tunnel segments
      for (let i = 0; i < segments; i++) {
        const z = (i + offset % tunnelDepth) / tunnelDepth;
        const scale = 1 - z;
        
        if (scale <= 0) continue;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) * 0.45 * scale;

        // Rocky tunnel walls with depth
        const wallGradient = ctx.createRadialGradient(
          centerX, centerY, radius * 0.85,
          centerX, centerY, radius
        );
        
        const brightness = Math.floor(20 + z * 40);
        wallGradient.addColorStop(0, `rgba(${brightness}, ${brightness * 0.7}, ${brightness * 0.5}, 0)`);
        wallGradient.addColorStop(0.7, `rgba(${60 + brightness}, ${50 + brightness * 0.7}, ${40 + brightness * 0.5}, ${0.3 + z * 0.4})`);
        wallGradient.addColorStop(1, `rgba(${80 + brightness}, ${70 + brightness * 0.7}, ${60 + brightness * 0.5}, ${0.6 + z * 0.3})`);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = wallGradient;
        ctx.lineWidth = 15 * scale;
        ctx.stroke();

        // Add rocky texture details
        if (i % 3 === 0) {
          const numRocks = 8;
          for (let j = 0; j < numRocks; j++) {
            const angle = (j / numRocks) * Math.PI * 2 + offset * 0.1;
            const rockRadius = radius * 0.95;
            const rockX = centerX + Math.cos(angle) * rockRadius;
            const rockY = centerY + Math.sin(angle) * rockRadius;
            const rockSize = 5 * scale;

            ctx.beginPath();
            ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(90, 70, 60, ${0.4 + z * 0.4})`;
            ctx.fill();
          }
        }
      }

      // Energy lines for Quantum Void theme
      const numLines = 4;
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2 + offset * 0.05;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        
        const lineGradient = ctx.createLinearGradient(0, -canvas.height / 2, 0, canvas.height / 2);
        lineGradient.addColorStop(0, "rgba(155, 135, 245, 0)");
        lineGradient.addColorStop(0.5, "rgba(155, 135, 245, 0.3)");
        lineGradient.addColorStop(1, "rgba(155, 135, 245, 0)");
        
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -canvas.height / 2);
        ctx.lineTo(0, canvas.height / 2);
        ctx.stroke();
        ctx.restore();
      }

      // Floating debris particles
      for (let i = 0; i < 20; i++) {
        const x = (canvas.width / 2) + Math.sin(offset * 0.02 + i) * (canvas.width * 0.4);
        const y = ((offset * 5 + i * 30) % canvas.height);
        const size = 2 + (i % 3);
        const alpha = 0.3 + Math.sin(offset * 0.1 + i) * 0.2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 100, 90, ${alpha})`;
        ctx.fill();
      }

      offset += 0.5;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

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
