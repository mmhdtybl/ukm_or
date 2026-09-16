"use client";

import { useEffect, useRef, useState } from "react";

interface Orb {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  phase: number;
  speed: number;
}

export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const lastMoveRef = useRef(Date.now());
  const orbsRef = useRef<Orb[]>([]);
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
      "rgba(0, 113, 227, 0.35)",
      "rgba(59, 130, 246, 0.3)",
      "rgba(99, 102, 241, 0.25)",
      "rgba(139, 92, 246, 0.2)",
      "rgba(0, 113, 227, 0.15)",
      "rgba(59, 130, 246, 0.2)",
    ];

    const orbCount = 6;
    orbsRef.current = Array.from({ length: orbCount }, (_, i) => {
      const angle = (i / orbCount) * Math.PI * 2;
      const dist = 150 + Math.random() * 100;
      return {
        x: canvas.width / 2 + Math.cos(angle) * dist,
        y: canvas.height / 2 + Math.sin(angle) * dist,
        baseX: canvas.width / 2 + Math.cos(angle) * dist,
        baseY: canvas.height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 80 + Math.random() * 60,
        color: colors[i % colors.length],
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
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

      orbsRef.current.forEach((orb, i) => {
        const orbitRadius = 60 + i * 20;
        const orbitSpeed = 0.4 + i * 0.1;

        if (!idle && mouseRef.current.active) {
          const angle = time * orbitSpeed + orb.phase;
          const targetX = mx + Math.cos(angle) * orbitRadius;
          const targetY = my + Math.sin(angle) * orbitRadius;
          orb.x += (targetX - orb.x) * 0.04;
          orb.y += (targetY - orb.y) * 0.04;
          orb.baseX = mx;
          orb.baseY = my;
        } else {
          const randX = Math.sin(time * orb.speed + orb.phase) * 200;
          const randY = Math.cos(time * orb.speed * 0.7 + orb.phase) * 150;
          const targetX = orb.baseX + randX;
          const targetY = orb.baseY + randY;
          orb.x += (targetX - orb.x) * 0.02;
          orb.y += (targetY - orb.y) * 0.02;

          orb.baseX += Math.sin(time * 0.2 + i) * 0.5;
          orb.baseY += Math.cos(time * 0.15 + i) * 0.5;

          orb.baseX = Math.max(-100, Math.min(canvas.width + 100, orb.baseX));
          orb.baseY = Math.max(-100, Math.min(canvas.height + 100, orb.baseY));
        }

        const pulse = Math.sin(time * 2 + orb.phase) * 10;
        const r = orb.radius + pulse;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
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
