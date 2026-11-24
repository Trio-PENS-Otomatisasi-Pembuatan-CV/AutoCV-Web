import React, { useEffect, useRef, useState } from "react";

export interface InteractiveGlowCanvasProps {
  className?: string;
  isDark?: boolean;
}

export const InteractiveGlowCanvas: React.FC<InteractiveGlowCanvasProps> = ({
  className = "",
  isDark = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const targetPos = useRef<{ x: number; y: number }>({ x: 500, y: 300 });
  const currentPos = useRef<{ x: number; y: number }>({ x: 500, y: 300 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      targetPos.current = { x: window.innerWidth / 2, y: 280 };
      currentPos.current = { x: window.innerWidth / 2, y: 280 };
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      // Smooth lerp interpolation for natural fluid following
      const ease = 0.08;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      if (spotlightRef.current) {
        const x = Math.round(currentPos.current.x);
        const y = Math.round(currentPos.current.y);
        spotlightRef.current.style.background = isDark
          ? `radial-gradient(circle 540px at ${x}px ${y}px, rgba(56, 189, 248, 0.20), rgba(99, 102, 241, 0.12) 45%, transparent 75%)`
          : `radial-gradient(circle 480px at ${x}px ${y}px, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.10) 40%, transparent 75%)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 transition-colors duration-300 ${className}`}
      aria-hidden="true"
    >
      {/* 1. Dynamic Mouse-following Radial Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 transition-opacity duration-300"
      />

      {/* 2. Top Ambient Aurora Glow */}
      <div
        className={`absolute -top-36 left-1/2 -translate-x-1/2 w-[980px] h-[520px] rounded-full blur-3xl transition-all duration-500 ${
          isDark
            ? "bg-gradient-to-b from-blue-600/20 via-indigo-600/15 to-transparent"
            : "bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent"
        }`}
      />
      <div
        className={`absolute top-16 right-5 w-[420px] h-[420px] rounded-full blur-3xl transition-all duration-500 ${
          isDark ? "bg-sky-500/12" : "bg-sky-400/12"
        }`}
      />
      <div
        className={`absolute top-48 left-5 w-[380px] h-[380px] rounded-full blur-3xl transition-all duration-500 ${
          isDark ? "bg-indigo-500/12" : "bg-indigo-400/10"
        }`}
      />

      {/* 3. Dot Matrix Pattern with Radial Vignette */}
      <div className="absolute inset-0 bg-dot-grid [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
    </div>
  );
};
