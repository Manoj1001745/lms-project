"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  score?: string;
};

type TestimonialsSliderProps = {
  items?: Testimonial[];
};

export function TestimonialsSlider({ items }: TestimonialsSliderProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const testimonials: Testimonial[] = useMemo(
    () =>
      items ?? [
        {
          quote:
            "The roadmap structure made it easy to stay consistent. The progress visuals kept me motivated every day.",
          name: "Aarav Sharma",
          title: "Banking Exam Aspirant",
          score: "+42% speed",
        },
        {
          quote:
            "Live sessions + recorded revisions are the perfect combo. The dashboard makes it feel like a premium product.",
          name: "Sana Khan",
          title: "SSC Prep",
          score: "Top 2%",
        },
        {
          quote:
            "Short tests after lessons changed everything. I finally know what to revise and what I’ve mastered.",
          name: "Rohit Verma",
          title: "Railway Group D",
          score: "3x confidence",
        },
      ],
    [items],
  );

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setActive((prev) => (prev + 1) % testimonials.length), 7000);
    return () => window.clearInterval(id);
  }, [reducedMotion, testimonials.length]);

  const current = testimonials[active];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Student success stories</p>
        <div className="flex gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActive(idx)}
              className={
                idx === active
                  ? "h-2.5 w-10 rounded-full bg-brand-blue"
                  : "h-2.5 w-2.5 rounded-full bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
              }
              aria-label={`Show testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6"
        >
          <p className="text-lg font-semibold leading-relaxed text-slate-900 dark:text-white">“{current.quote}”</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{current.name}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{current.title}</p>
            </div>
            {current.score && (
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                {current.score}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
