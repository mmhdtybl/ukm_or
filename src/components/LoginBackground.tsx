"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  alpha: number;
  color: string;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
  pulseSpeed: number;
  pulseAmp: number;
}

export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const lastMoveRef = useRef(Date.now());
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      [0, 113, 227],
      [59, 130, 246],
      [99, 102, 241],
      [139, 92, 246],
      [180, 180, 255],
      [200, 220, 255],
      [255, 255, 255],
    ];

    const particleCount = 180;
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const c = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        baseX: Math.random() * canvas.width,
        baseY: Math.random() * canvas.height,
        radius: 0.5 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        color: `${c[0]}, ${c[1]}, ${c[2]}`,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.8,
        driftX: (Math.random() - 0.5) * 0.3,
        driftY: (Math.random() - 0.5) * 0.3,
        pulseSpeed: 1 + Math.random() * 3,
        pulseAmp: 0.1 + Math.random() * 0.3,
      };
    });

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
      lastMoveRef.current = Date.now();
    };
    window.addEventListener("mousemove", onMouseMove);

    let time = 0;
    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const idle = Date.now() - lastMoveRef.current > 800;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p, i) => {
        if (!idle && mouseRef.current.active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const pull = Math.min(0.03, 0.001 + dist * 0.00002);
          p.x += dx * pull + Math.sin(time * p.speed + p.phase) * 0.5;
          p.y += dy * pull + Math.cos(time * p.speed * 0.7 + p.phase) * 0.5;
        } else {
          p.baseX += p.driftX;
          p.baseY += p.driftY;

          if (p.baseX < -50) p.baseX = canvas.width + 50;
          if (p.baseX > canvas.width + 50) p.baseX = -50;
          if (p.baseY < -50) p.baseY = canvas.height + 50;
          if (p.baseY > canvas.height + 50) p.baseY = -50;

          const wobbleX = Math.sin(time * p.speed * 0.5 + p.phase) * 30;
          const wobbleY = Math.cos(time * p.speed * 0.3 + p.phase) * 20;
          const targetX = p.baseX + wobbleX;
          const targetY = p.baseY + wobbleY;
          p.x += (targetX - p.x) * 0.01;
          p.y += (targetY - p.y) * 0.01;
        }

        const pulse = Math.sin(time * p.pulseSpeed + p.phase) * p.pulseAmp;
        const currentAlpha = Math.max(0.05, p.alpha + pulse);
        const currentRadius = p.radius + Math.sin(time * 1.5 + p.phase) * 0.5;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 3);
        grad.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
        grad.addColorStop(0.4, `rgba(${p.color}, ${currentAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, currentAlpha * 1.5)})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
