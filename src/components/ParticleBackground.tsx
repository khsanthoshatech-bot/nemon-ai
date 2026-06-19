import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ParticleBackgroundProps {
  theme: "neon-purple" | "neon-orange" | "neon-dual";
}

export default function ParticleBackground({ theme }: ParticleBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const [gradientPositions, setGradientPositions] = useState({
    g1: { x: 30, y: 40 },
    g2: { x: 70, y: 60 },
  });

  // Track mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Soft gradient mesh animation
  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 0.005;
      setGradientPositions({
        g1: {
          x: 40 + Math.sin(tick) * 25,
          y: 40 + Math.cos(tick * 1.2) * 20,
        },
        g2: {
          x: 60 + Math.cos(tick * 0.8) * 25,
          y: 50 + Math.sin(tick * 1.1) * 20,
        },
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  // Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    const maxParticles = 60;

    const colors = {
      purple: "168, 85, 247",
      orange: "249, 115, 22",
    };

    const getRandomColor = () => {
      if (theme === "neon-purple") return colors.purple;
      if (theme === "neon-orange") return colors.orange;
      return Math.random() > 0.5 ? colors.purple : colors.orange;
    };

    // Canvas size management via ResizeObserver
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;

        // Initialize particles
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 2 + 1,
            color: getRandomColor(),
            alpha: Math.random() * 0.5 + 0.1,
            decay: 0.0005 + Math.random() * 0.001,
          });
        }
      }
    });

    resizeObserver.observe(container);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse position interpolation (lerp)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw subtle neon grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Render & update particles
      particles.forEach((p, idx) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Interactive gravity towards mouse when close
        if (mouse.x > -500 && mouse.y > -500) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.x += (dx / dist) * force * 0.8;
            p.y += (dy / dist) * force * 0.8;
          }
        }

        // Boundary bounce or wrap-around
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw connections if particles are close to each other
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 85) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const connectionAlpha = (1 - dist / 85) * 0.08 * p.alpha;
            ctx.strokeStyle = `rgba(${p.color}, ${connectionAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = `rgb(${p.color})`;
        ctx.shadowBlur = Math.random() > 0.95 ? 6 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw mouse interactive glowing aura
      if (mouse.x > -500 && mouse.y > -500) {
        const radGrd = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 110);
        const glowColor = theme === "neon-purple" ? "168, 85, 247" : theme === "neon-orange" ? "249, 115, 22" : "139, 92, 246";
        radGrd.addColorStop(0, `rgba(${glowColor}, 0.09)`);
        radGrd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = radGrd;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 110, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [theme]);

  // Color mappings for active backgrounds
  const glowColors = {
    "neon-purple": {
      left: "rgba(168, 85, 247, 0.12)",
      right: "rgba(124, 58, 237, 0.05)",
    },
    "neon-orange": {
      left: "rgba(249, 115, 22, 0.12)",
      right: "rgba(234, 88, 12, 0.05)",
    },
    "neon-dual": {
      left: "rgba(168, 85, 247, 0.10)",
      right: "rgba(249, 115, 22, 0.08)",
    },
  };

  const colors = glowColors[theme];

  return (
    <div id="particle-container" ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#050505]">
      {/* Aurora mesh gradients */}
      <div
        className="absolute w-[50vw] h-[50vh] rounded-full filter blur-[120px] transition-all duration-1000 ease-out-quintic pointer-events-none opacity-60"
        style={{
          left: `${gradientPositions.g1.x}%`,
          top: `${gradientPositions.g1.y}%`,
          background: `radial-gradient(circle, ${colors.left} 0%, rgba(0,0,0,0) 70%)`,
          transform: "translate(-50%, -50%)",
        }}
      />
      <div
        className="absolute w-[45vw] h-[45vh] rounded-full filter blur-[100px] transition-all duration-1000 ease-out-quintic pointer-events-none opacity-50"
        style={{
          left: `${gradientPositions.g2.x}%`,
          top: `${gradientPositions.g2.y}%`,
          background: `radial-gradient(circle, ${colors.right} 0%, rgba(0,0,0,0) 70%)`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Grid subtle dots overlay */}
      <div 
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Canvas particle scene */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
