"use client";

import type { ReactNode } from "react";
import { Children } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type HorizontalCarouselProps = {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  controlsLabel: string;
};

export function HorizontalCarousel({
  children,
  className = "",
  itemClassName = "",
  controlsLabel,
}: HorizontalCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < maxLeft - 1);
  }, []);

  useEffect(() => {
    update();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const resize = new ResizeObserver(() => update());
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      resize.disconnect();
    };
  }, [update]);

  const scrollByViewport = useCallback((direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.max(280, Math.round(el.clientWidth * 0.9));
    el.scrollBy({ left: direction === "left" ? -delta : delta, behavior: "smooth" });
  }, []);

  const controlsId = useMemo(() => controlsLabel.replace(/\s+/g, "-").toLowerCase(), [controlsLabel]);

  return (
    <div className={className} aria-label={controlsLabel}>
      <div className="relative">
        <div
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-1 pb-1"
          ref={scrollerRef}
          id={controlsId}
        >
          {items.map((child, idx) => (
            <div key={idx} className={`snap-start ${itemClassName}`}>
              {child}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950" />

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => scrollByViewport("left")}
            disabled={!canScrollLeft}
            aria-controls={controlsId}
            aria-label="Scroll left"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => scrollByViewport("right")}
            disabled={!canScrollRight}
            aria-controls={controlsId}
            aria-label="Scroll right"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
