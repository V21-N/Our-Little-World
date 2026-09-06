"use client";

import { useEffect, useState } from "react";

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  emoji: boolean;
}

const generateHearts = (count: number): Heart[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 14 + Math.random() * 22,
    duration: 12 + Math.random() * 14,
    delay: Math.random() * -20,
    drift: (Math.random() - 0.5) * 80,
    opacity: 0.18 + Math.random() * 0.4,
    emoji: Math.random() > 0.55,
  }));

export function FloatingHearts({ count = 14 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    setHearts(generateHearts(count));
    setMounted(true);
  }, [count]);

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={
            {
              left: `${h.left}%`,
              fontSize: `${h.size}px`,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
              "--drift": `${h.drift}px`,
              "--opacity": h.opacity,
              color: "var(--color-primary)",
            } as React.CSSProperties & { [key: `--${string}`]: string | number }
          }
        >
          {h.emoji ? "❤" : "♡"}
        </span>
      ))}
    </div>
  );
}