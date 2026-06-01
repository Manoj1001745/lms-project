"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  durationMs?: number;
  format?: (value: number) => string;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function AnimatedCounter({
  value,
  durationMs = 1000,
  format,
  className = "",
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const nodeRef = useRef<HTMLSpanElement | null>(null);

  const formatter = useMemo(() => {
    return format ?? ((n: number) => n.toLocaleString());
  }, [format]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const progress = clamp((now - start) / durationMs, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [hasStarted, value, durationMs]);

  return (
    <span ref={nodeRef} className={className}>
      {formatter(display)}
    </span>
  );
}
