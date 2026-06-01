"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { SiteChrome } from "@/components/public/site-chrome";
import { api } from "@/services/api";

type Professor = {
  id: number;
  name: string;
  avatar_url?: string | null;
  taught_courses_count: number;
};

type ProfessorsResponse = {
  professors: Professor[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AboutPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-professors"],
    queryFn: async () => {
      const response = await api.get<ProfessorsResponse>("/professors");
      return response.data;
    },
  });

  const professors = data?.professors ?? [];

  return (
    <SiteChrome>
      <main className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_55%)]" />
          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-brand-yellow/30 blur-3xl" />
          <div className="absolute -left-20 top-32 h-64 w-64 rounded-full bg-brand-green/20 blur-3xl" />
          <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-blue">
                LearningHun story
              </p>
              <h1 className="font-display mt-4 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
                A learning platform built for momentum, not just content.
              </h1>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                We blend live classes, structured recordings, and accountability tools so learners stay consistent and
                confident. Our mission is to make competitive prep feel calm, visual, and reachable.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-sm"
                >
                  Browse courses
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-slate-300 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800"
                >
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Momentum-first",
                  description: "Roadmaps, streaks, and checkpoints that keep learners engaged daily.",
                },
                {
                  title: "Guided clarity",
                  description: "No cluttered menus. Everything flows from goal to next action.",
                },
                {
                  title: "Human coaching",
                  description: "Professors and mentors who show up with real feedback.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
                >
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-green">Meet the professors</p>
              <h2 className="font-display mt-3 text-3xl font-bold text-slate-900 dark:text-white">Faculty that guide every step</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                From live classes to recorded tracks, our professors build clarity and confidence. The team below is
                pulled directly from the instructors you assign in the admin panel.
              </p>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-brand-blue">
              Explore programs ->
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                Loading professors...
              </div>
            )}
            {isError && (
              <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                Unable to load professors right now.
              </div>
            )}
            {!isLoading && !isError && professors.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                No professors are active yet. Add faculty from the admin panel to showcase them here.
              </div>
            )}
            {professors.map((professor) => (
              <div
                key={professor.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  {professor.avatar_url ? (
                    <img
                      src={professor.avatar_url}
                      alt={professor.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-brand-blue/10 text-sm font-semibold text-brand-blue">
                      {getInitials(professor.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{professor.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {professor.taught_courses_count} course{professor.taught_courses_count === 1 ? "" : "s"} authored
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  Focus: structured lessons, practice blocks, and targeted feedback.
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Ready to build your learning rhythm?</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Join learners who track progress, celebrate milestones, and stay consistent all week.
                </p>
              </div>
              <Link
                href="/register"
                className="rounded-xl bg-brand-green px-5 py-3 text-sm font-semibold text-white shadow-sm"
              >
                Start your journey
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
