"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AnimatedCounter } from "@/components/public/home/animated-counter";

type HeroStats = {
  courses: number;
  instructors: number;
  free_courses: number;
  paid_courses: number;
};

export type HeroSlide = {
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
  highlights: Array<{ label: string; value: string }>;
};

type HeroSliderProps = {
  headline: string;
  subheadline: string;
  stats?: HeroStats;
};

export function HeroSlider({ headline, subheadline, stats }: HeroSliderProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  const slides: HeroSlide[] = useMemo(
    () => [
      {
        badge: "Live + Recorded + Test Series",
        title: headline,
        subtitle: subheadline,
        primaryCta: { href: "/catalog", label: "Explore Courses" },
        secondaryCta: { href: "/register", label: "Start Free" },
        highlights: [
          { label: "Structured", value: "Roadmaps" },
          { label: "Practice", value: "Mock Tests" },
          { label: "Track", value: "Progress" },
        ],
      },
      {
        badge: "Premium learning flow",
        title: "Build a streak. Track mastery. Win exams.",
        subtitle: "Beautiful learning cards, skill progress visuals, and roadmap-based curriculum designed to keep momentum.",
        primaryCta: { href: "/catalog", label: "Find Your Track" },
        secondaryCta: { href: "/login", label: "Resume Learning" },
        highlights: [
          { label: "Guided", value: "Milestones" },
          { label: "Daily", value: "Targets" },
          { label: "Smart", value: "Reviews" },
        ],
      },
      {
        badge: "Community-powered",
        title: "Learn together with mentors & peers.",
        subtitle: "Live classes, doubt solving, leaderboards, and discussions — all designed to keep learners engaged.",
        primaryCta: { href: "/register", label: "Join Community" },
        secondaryCta: { href: "/contact", label: "Talk to Us" },
        highlights: [
          { label: "Live", value: "Classes" },
          { label: "Top", value: "Mentors" },
          { label: "Real", value: "Wins" },
        ],
      },
    ],
    [headline, subheadline],
  );

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setActive((prev) => (prev + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [reducedMotion, slides.length]);

  const slide = slides[active];

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-50 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl"
          animate={reducedMotion ? undefined : { y: [0, 18, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-32 h-80 w-80 rounded-full bg-brand-yellow/10 blur-3xl"
          animate={reducedMotion ? undefined : { y: [0, -14, 0], x: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-[70%] h-96 w-96 -translate-x-1/2 rounded-full bg-brand-green/10 blur-3xl"
          animate={reducedMotion ? undefined : { y: [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
                <span className="h-2 w-2 rounded-full bg-brand-green" />
                {slide.badge}
              </p>

              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                {slide.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.primaryCta.href}
                  className="group inline-flex items-center justify-center rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  {slide.primaryCta.label}
                  <span className="ml-2 transition group-hover:translate-x-0.5" aria-hidden>
                    →
                  </span>
                </Link>
                <Link
                  href={slide.secondaryCta.href}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                >
                  {slide.secondaryCta.label}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {slide.highlights.map((h) => (
                  <span
                    key={h.label}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                  >
                    <span className="text-slate-500 dark:text-slate-400">{h.label}</span>
                    <span className="text-slate-900 dark:text-white">{h.value}</span>
                  </span>
                ))}
              </div>

              <div className="mt-8 flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={
                      idx === active
                        ? "h-2.5 w-10 rounded-full bg-brand-blue"
                        : "h-2.5 w-2.5 rounded-full bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                    }
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative">
          <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 sm:grid-cols-2">
            <HeroStatCard
              label="Courses"
              value={stats?.courses ?? 0}
              accent="text-brand-blue"
              icon={<GridIcon />}
            />
            <HeroStatCard
              label="Instructors"
              value={stats?.instructors ?? 0}
              accent="text-brand-green"
              icon={<SparkIcon />}
            />
            <HeroStatCard
              label="Free Courses"
              value={stats?.free_courses ?? 0}
              accent="text-brand-yellow"
              icon={<BoltIcon />}
            />
            <HeroStatCard
              label="Paid Courses"
              value={stats?.paid_courses ?? 0}
              accent="text-slate-900 dark:text-white"
              icon={<CrownIcon />}
            />
          </div>

          <motion.div
            className="absolute -bottom-6 -left-4 hidden w-[14rem] rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 md:block"
            animate={reducedMotion ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Today’s momentum</p>
            <p className="mt-1 text-sm font-bold">Keep your streak alive</p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-2 w-2/3 rounded-full bg-brand-blue" />
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">23 mins to hit your goal</p>
          </motion.div>

          <motion.div
            className="absolute -right-4 top-8 hidden w-[12rem] rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 md:block"
            animate={reducedMotion ? undefined : { y: [0, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Next live class</p>
            <p className="mt-1 text-sm font-bold">Starts in 1h 15m</p>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Set reminders & join instantly.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroStatCard({
  label,
  value,
  accent,
  icon,
}: {
  label: string;
  value: number;
  accent: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/70 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-800/80 dark:bg-slate-950/30 dark:hover:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <AnimatedCounter
            value={value}
            className={`mt-2 block text-3xl font-extrabold tracking-tight ${accent}`}
          />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition group-hover:scale-[1.03] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function GridIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2l1.2 4.4L18 8l-4.8 1.6L12 14l-1.2-4.4L6 8l4.8-1.6L12 2z" />
      <path d="M5 13l.6 2.2L8 16l-2.4.8L5 19l-.6-2.2L2 16l2.4-.8L5 13z" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 18h14l1-10-4 3-4-6-4 6-4-3 1 10z" />
      <path d="M5 18v2h14v-2" />
    </svg>
  );
}
