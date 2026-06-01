"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { CourseCard } from "@/components/courses/course-card";
import { FaqAccordion } from "@/components/public/home/faq-accordion";
import { HeroSlider } from "@/components/public/home/hero-slider";
import { HorizontalCarousel } from "@/components/public/home/horizontal-carousel";
import { Reveal } from "@/components/public/home/reveal";
import { SectionHeading, SectionShell } from "@/components/public/home/section-shell";
import { TestimonialsSlider } from "@/components/public/home/testimonials-slider";
import { SiteChrome } from "@/components/public/site-chrome";
import { api } from "@/services/api";
import { getCategoryName } from "@/lib/course-media";
import type { CourseCardData } from "@/types/course-card";

type PublicCourse = CourseCardData & {
  original_price: number;
  discount_percent: number;
};

type CatalogResponse = {
  hero: {
    headline: string;
    subheadline: string;
  };
  stats: {
    courses: number;
    free_courses: number;
    paid_courses: number;
    instructors: number;
  };
  featured: PublicCourse[];
  browse: PublicCourse[];
};

function pickCourses(courses: PublicCourse[] | undefined, keyword: RegExp) {
  return (courses ?? []).filter(
    (course) => keyword.test(course.title) || keyword.test(course.category ?? "") || keyword.test(course.description ?? ""),
  );
}

type CategoryStat = {
  name: string;
  count: number;
};

export default function PublicHomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-catalog-home"],
    queryFn: async () => {
      const response = await api.get<CatalogResponse>("/courses/catalog");
      return response.data;
    },
  });

  const liveCourses = pickCourses(data?.browse, /live/i);
  const recordedCourses = pickCourses(data?.browse, /recorded/i);
  const testSeriesCourses = pickCourses(data?.browse, /test|series|mock/i);
  const freeCourses = (data?.browse ?? []).filter((course) => course.is_free);

  const trendingCategories: CategoryStat[] = (() => {
    const counts = new Map<string, number>();
    for (const course of data?.browse ?? []) {
      const key = getCategoryName(course.category);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  })();

  const featuredCourses = data?.featured ?? [];
  const browseCourses = data?.browse ?? [];
  const liveSpotlight = (liveCourses.length > 0 ? liveCourses : browseCourses).slice(0, 8);
  const recordedSpotlight = (recordedCourses.length > 0 ? recordedCourses : browseCourses).slice(0, 8);
  const testSpotlight = (testSeriesCourses.length > 0 ? testSeriesCourses : browseCourses).slice(0, 8);
  const freeSpotlight = (freeCourses.length > 0 ? freeCourses : browseCourses).slice(0, 8);

  return (
    <SiteChrome>
      <HeroSlider
        headline={data?.hero.headline ?? "Smart Learning Experience for Competitive Aspirants"}
        subheadline={
          data?.hero.subheadline ??
          "Build momentum with structured classes, recorded paths, and performance-ready test practice."
        }
        stats={data?.stats}
      />

      {isLoading && (
        <SectionShell>
          <div className="lms-card p-6 text-slate-600 dark:text-slate-300">Loading homepage…</div>
        </SectionShell>
      )}

      {isError && (
        <SectionShell>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load courses from API. Please check backend API URL and server.
          </div>
        </SectionShell>
      )}

      {!isLoading && !isError && (
        <>
          <SectionShell className="pt-10">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Bento highlights
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Designed to keep you consistent</h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Premium layouts, micro-interactions, progress visuals, and clean hierarchy — inspired by Stripe,
                      Coursera, Notion, and Linear.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <BentoTile
                        title="Live classes"
                        subtitle="Join on time, ask doubts, stay accountable."
                        href="#live"
                        accent="bg-brand-green/10"
                        icon={<LiveIcon />}
                      />
                      <BentoTile
                        title="Recorded tracks"
                        subtitle="Rewatch, revise, and learn at your pace."
                        href="#recorded"
                        accent="bg-brand-blue/10"
                        icon={<PlayIcon />}
                      />
                      <BentoTile
                        title="Test series"
                        subtitle="Exam-like mocks with confidence-building flow."
                        href="#tests"
                        accent="bg-brand-yellow/15"
                        icon={<TargetIcon />}
                      />
                      <BentoTile
                        title="Certificates"
                        subtitle="Track achievements and share milestones."
                        href="#achievements"
                        accent="bg-slate-900/5 dark:bg-white/5"
                        icon={<BadgeIcon />}
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="grid gap-4">
                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-blue/10 via-white/60 to-brand-yellow/10 p-6 backdrop-blur dark:border-slate-800 dark:from-brand-blue/10 dark:via-slate-900/40 dark:to-brand-yellow/10">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Learning roadmap</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        A focused loop: learn → practice → review → score.
                      </p>
                      <div className="mt-5 space-y-3">
                        <RoadmapStep index="01" title="Diagnose" text="Take a quick baseline test." />
                        <RoadmapStep index="02" title="Learn" text="Follow a structured course track." />
                        <RoadmapStep index="03" title="Practice" text="Short quizzes after each topic." />
                        <RoadmapStep index="04" title="Revise" text="Target weak areas smartly." />
                        <RoadmapStep index="05" title="Perform" text="Mock tests like the real exam." />
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Skill progress</p>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        Visual progress keeps learners engaged — even on mobile.
                      </p>
                      <div className="mt-5 space-y-4">
                        <ProgressRow label="Quant" value={72} accent="bg-brand-blue" />
                        <ProgressRow label="Reasoning" value={58} accent="bg-brand-green" />
                        <ProgressRow label="English" value={81} accent="bg-brand-yellow" />
                      </div>
                      <div className="mt-6 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          7-day streak
                        </span>
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          Weekly goal: 3h
                        </span>
                        <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          Next milestone
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Featured"
                title="Featured courses, with a premium card experience"
                subtitle="Interactive cards, smooth scrolling, and fast discovery — optimized for engagement."
                actions={
                  <Link
                    href="/catalog"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Browse all
                  </Link>
                }
              />

              <div className="mt-6">
                <HorizontalCarousel controlsLabel="Featured courses carousel" itemClassName="min-w-[18rem] max-w-[18rem] sm:min-w-[22rem] sm:max-w-[22rem]">
                  {featuredCourses.slice(0, 10).map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      detailsHref={`/catalog/${course.id}`}
                      actionLabel="View Details"
                      className="transition hover:-translate-y-0.5"
                    />
                  ))}
                </HorizontalCarousel>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="categories" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Discover"
                title="Trending categories"
                subtitle="Explore what learners are focusing on right now."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trendingCategories.length > 0 ? (
                  trendingCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/catalog?category=${encodeURIComponent(cat.name)}`}
                      className="group rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{cat.count} courses</p>
                        </div>
                        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition group-hover:scale-[1.03] dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                          <CategoryIcon />
                        </span>
                      </div>
                      <div className="mt-5 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-brand-blue"
                          style={{ width: `${Math.max(12, Math.min(100, (cat.count / Math.max(1, trendingCategories[0]?.count ?? 1)) * 100))}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs font-semibold text-brand-blue dark:text-brand-yellow">Explore →</p>
                    </Link>
                  ))
                ) : (
                  <div className="lms-card p-6 text-slate-600 dark:text-slate-300 sm:col-span-2 lg:col-span-4">
                    Categories will appear once catalog data is available.
                  </div>
                )}
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="live" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Live"
                title="Live classes that feel like a premium experience"
                subtitle="Spotlight ongoing or upcoming sessions and keep learners returning."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-green/10 via-white/60 to-brand-blue/10 p-6 backdrop-blur dark:border-slate-800 dark:from-brand-green/10 dark:via-slate-900/40 dark:to-brand-blue/10 lg:col-span-5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Live schedule preview</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Show what’s happening today, and make joining one click.
                  </p>
                  <div className="mt-6 space-y-3">
                    <ScheduleRow time="07:00 PM" title="Quant: Speed drills" meta="45 mins" pill="Starts soon" />
                    <ScheduleRow time="08:00 PM" title="Reasoning: Puzzles" meta="60 mins" pill="Live" />
                    <ScheduleRow time="09:30 PM" title="English: Reading" meta="40 mins" pill="Reminder" />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link href="/catalog" className="rounded-xl bg-brand-green px-4 py-2 text-sm font-bold text-slate-900">
                      View live courses
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                    >
                      Get reminders
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <HorizontalCarousel controlsLabel="Live courses carousel" itemClassName="min-w-[18rem] max-w-[18rem] sm:min-w-[22rem] sm:max-w-[22rem]">
                    {liveSpotlight.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        detailsHref={`/catalog/${course.id}`}
                        actionLabel="Join / Details"
                        className="transition hover:-translate-y-0.5"
                      />
                    ))}
                  </HorizontalCarousel>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="recorded" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Recorded"
                title="Recorded tracks with smooth discovery"
                subtitle="Keep content accessible and binge-friendly without clutter."
              />
              <div className="mt-6">
                <HorizontalCarousel controlsLabel="Recorded courses carousel" itemClassName="min-w-[18rem] max-w-[18rem] sm:min-w-[22rem] sm:max-w-[22rem]">
                  {recordedSpotlight.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      detailsHref={`/catalog/${course.id}`}
                      actionLabel="View"
                      className="transition hover:-translate-y-0.5"
                    />
                  ))}
                </HorizontalCarousel>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="tests" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Practice"
                title="Test series that boosts confidence"
                subtitle="Exam-like practice flows: quick, focused, and motivating."
              />
              <div className="mt-6">
                <HorizontalCarousel controlsLabel="Test series carousel" itemClassName="min-w-[18rem] max-w-[18rem] sm:min-w-[22rem] sm:max-w-[22rem]">
                  {testSpotlight.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      detailsHref={`/catalog/${course.id}`}
                      actionLabel="Practice"
                      className="transition hover:-translate-y-0.5"
                    />
                  ))}
                </HorizontalCarousel>
              </div>
            </Reveal>
          </SectionShell>

          {/* <SectionShell className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Mentors"
                title="Top professors"
                subtitle="A premium carousel that builds trust and gives learners a human connection."
                actions={
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Become an instructor
                  </Link>
                }
              />
              <div className="mt-6">
                <HorizontalCarousel
                  controlsLabel="Top professors carousel"
                  itemClassName="min-w-[16.5rem] max-w-[16.5rem] sm:min-w-[18.5rem] sm:max-w-[18.5rem]"
                >
                  {[
                    { name: "Dr. Neha", subject: "Quant", rating: "4.9", learners: "18k" },
                    { name: "Prof. Aman", subject: "Reasoning", rating: "4.8", learners: "21k" },
                    { name: "Ms. Riya", subject: "English", rating: "4.9", learners: "15k" },
                    { name: "Mr. Sandeep", subject: "GK", rating: "4.7", learners: "12k" },
                    { name: "Coach Sana", subject: "Mocks", rating: "4.8", learners: "17k" },
                  ].map((p) => (
                    <ProfessorCard key={p.name} {...p} />
                  ))}
                </HorizontalCarousel>
              </div>
            </Reveal>
          </SectionShell> */}

          <SectionShell className="pt-0">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <TestimonialsSlider />
                </div>
                <div className="lg:col-span-5">
                  <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Interactive CTA</p>
                    <h3 className="mt-2 text-xl font-black tracking-tight">Start with free lessons, upgrade anytime</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Let learners experience the product first. Smooth upgrades improve conversion.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <Link href="/catalog" className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white">
                        Explore free courses
                      </Link>
                      <Link
                        href="#pricing"
                        className="rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                      >
                        See pricing
                      </Link>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <MiniMetric label="Completion boost" value="+18%" />
                      <MiniMetric label="Daily retention" value="+23%" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="achievements" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Motivation"
                title="Achievements, leaderboard, and community"
                subtitle="Make the UI feel alive with progress visuals, wins, and social proof."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Achievements</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Floating badges and milestones drive consistency.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <BadgePill label="7-day streak" tone="blue" />
                    <BadgePill label="Top 10% quiz" tone="green" />
                    <BadgePill label="Mock test hero" tone="yellow" />
                    <BadgePill label="Course completed" tone="neutral" />
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Next badge</p>
                    <p className="mt-1 text-sm font-bold">Consistency Pro</p>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                      <div className="h-2 w-[68%] rounded-full bg-brand-blue" />
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">2 days to unlock</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Leaderboard</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Friendly competition boosts momentum.</p>
                  <div className="mt-5 space-y-3">
                    <LeaderRow rank={1} name="Nisha" score={9840} accent="bg-brand-yellow" />
                    <LeaderRow rank={2} name="Arjun" score={9620} accent="bg-brand-blue" />
                    <LeaderRow rank={3} name="Meera" score={9410} accent="bg-brand-green" />
                    <LeaderRow rank={4} name="Sagar" score={9050} accent="bg-slate-700" />
                    <LeaderRow rank={5} name="Tanya" score={8920} accent="bg-slate-700" />
                  </div>
                  <div className="mt-6">
                    <Link href="/register" className="text-sm font-semibold text-brand-blue dark:text-brand-yellow">
                      Join to compete →
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Community preview</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A quick look at discussions.</p>
                  <div className="mt-5 space-y-3">
                    <DiscussionRow title="How to revise quant fast?" meta="12 replies · 2h ago" />
                    <DiscussionRow title="Best mock test strategy" meta="19 replies · 6h ago" />
                    <DiscussionRow title="Live class notes thread" meta="8 replies · yesterday" />
                  </div>
                  <div className="mt-6">
                    <Link href="/register" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
                      Join community
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="pricing" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Premium"
                title="Upgrade to premium learning"
                subtitle="A clean subscription section with strong value proposition and upgrade CTAs."
                align="center"
              />
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                <PricingCard
                  title="Starter"
                  price="Free"
                  description="Begin instantly with free lessons."
                  cta={{ href: "/catalog", label: "Start free" }}
                  items={["Browse free modules", "Basic progress tracking", "Community preview"]}
                />
                <PricingCard
                  title="Pro"
                  price="Rs 999"
                  description="Best for serious aspirants."
                  highlight
                  cta={{ href: "/register", label: "Go Pro" }}
                  items={["Live + recorded access", "Test series + analytics", "Certificates", "Priority support"]}
                />
                <PricingCard
                  title="Elite"
                  price="Rs 1,999"
                  description="Mentor-guided outcomes."
                  cta={{ href: "/contact", label: "Talk to sales" }}
                  items={["Mentor sessions", "Advanced mock schedule", "Leaderboard perks", "Dedicated help"]}
                />
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="News"
                title="Latest updates & exam tips"
                subtitle="A modern blog/news section that builds trust and organic traffic."
                actions={
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur transition hover:bg-white dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Suggest a topic
                  </Link>
                }
              />
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <BlogCard
                  title="7-day revision plan"
                  meta="Strategy · 5 min read"
                  excerpt="A tight plan for busy learners that still moves the needle."
                />
                <BlogCard
                  title="Mock test mindset"
                  meta="Practice · 4 min read"
                  excerpt="How to use mocks as feedback loops — not stress." 
                />
                <BlogCard
                  title="Live class note-taking"
                  meta="Learning · 6 min read"
                  excerpt="Simple note systems that improve retention and revision speed." 
                />
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell id="about" className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="About"
                title="About LearningHun"
                subtitle="A learning experience built for consistency, clarity, and outcomes — not clutter."
              />

              <div className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-7">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Our mission</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">Make exam prep feel premium and focused</h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    LearningHun combines live classes, recorded tracks, and test practice with a modern UI system: clear
                    hierarchy, progress visuals, and delightful micro-interactions.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <AboutPill title="Clarity" text="Notion-like organization" />
                    <AboutPill title="Momentum" text="Streaks + progress" />
                    <AboutPill title="Outcomes" text="Mocks + analytics" />
                  </div>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link href="/catalog" className="rounded-xl bg-brand-blue px-5 py-3 text-sm font-bold text-white">
                      Explore courses
                    </Link>
                    <Link
                      href="/contact"
                      className="rounded-xl border border-slate-300 bg-white/60 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                    >
                      Contact us
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 lg:col-span-5">
                  <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-blue/10 via-white/70 to-brand-green/10 p-6 backdrop-blur dark:border-slate-800 dark:via-slate-900/40">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">What you get</p>
                    <div className="mt-4 space-y-3">
                      <AboutRow title="Premium layouts" text="Bento grids, glass cards, responsive sections." />
                      <AboutRow title="Smooth learning flow" text="Roadmaps and progress visuals that feel alive." />
                      <AboutRow title="Fast discovery" text="Carousels and interactive course cards." />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white dark:border-slate-800">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Built for trust</p>
                    <p className="mt-2 text-lg font-black">Clean UX + reliable performance</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Learners stay when the interface is calm, quick, and motivating.
                    </p>
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <TrustMetric label="Mobile-first" />
                      <TrustMetric label="Dark mode" />
                      <TrustMetric label="Secure" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          {/* <SectionShell className="pt-0">
            <Reveal>
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white dark:border-slate-800 lg:col-span-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Mobile app</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight">Learn anywhere, stay consistent</h2>
                  <p className="mt-3 max-w-xl text-sm text-slate-300">
                    Continue learning on mobile with a focused experience for classes, tests, and progress tracking.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="https://play.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-brand-green px-5 py-3 text-sm font-bold text-slate-900"
                    >
                      Google Play
                    </a>
                    <a
                      href="https://www.apple.com/app-store/"
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-slate-900"
                    >
                      App Store
                    </a>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/70 p-8 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50 lg:col-span-5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Free courses spotlight</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A frictionless entry point for new learners.</p>
                  <div className="mt-5">
                    <HorizontalCarousel controlsLabel="Free courses carousel" itemClassName="min-w-[16rem] max-w-[16rem]">
                      {freeSpotlight.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          detailsHref={`/catalog/${course.id}`}
                          actionLabel="Start"
                          compact
                          className="transition hover:-translate-y-0.5"
                        />
                      ))}
                    </HorizontalCarousel>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell> */}

          <SectionShell className="pt-0">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ"
                title="Frequently asked questions"
                subtitle="Reduce hesitation and increase conversions with clear answers."
              />
              <div className="mt-6 grid gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <FaqAccordion
                    items={[
                      {
                        question: "Do you have both live and recorded classes?",
                        answer:
                          "Yes. LearningHun supports live batches, recorded tracks, and test practice — so you can learn in the format that fits your schedule.",
                      },
                      {
                        question: "Can I start for free?",
                        answer:
                          "Yes. Start with free courses to experience the platform. Upgrade to premium anytime for full access and analytics.",
                      },
                      {
                        question: "Is the experience mobile-friendly?",
                        answer:
                          "Fully responsive UI with smooth navigation and learning-focused layouts designed for mobile usage.",
                      },
                      {
                        question: "How do certificates work?",
                        answer:
                          "Certificates can be issued when learners complete course milestones. The UI surfaces achievements as motivational triggers.",
                      },
                    ]}
                  />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-blue/10 via-white/60 to-brand-green/10 p-6 backdrop-blur dark:border-slate-800 dark:from-brand-blue/10 dark:via-slate-900/40 dark:to-brand-green/10 lg:col-span-5">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Need help choosing?</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Tell us your goal and we’ll suggest the right track.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Link href="/contact" className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white">
                      Contact support
                    </Link>
                    <Link
                      href="/catalog"
                      className="rounded-xl border border-slate-300 bg-white/60 px-4 py-2 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                    >
                      Explore catalog
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>

          <SectionShell className="pt-0">
            <Reveal>
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-brand-blue/15 via-brand-yellow/10 to-brand-green/10 p-8 backdrop-blur dark:border-slate-800">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Final CTA
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight">Build momentum today</h2>
                    <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                      Start with free courses, explore premium tracks, and keep consistency with progress visuals.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/register" className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-900">
                      Create account
                    </Link>
                    <Link
                      href="/catalog"
                      className="rounded-xl border border-slate-300 bg-white/60 px-5 py-3 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
                    >
                      Explore catalog
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </SectionShell>
        </>
      )}
    </SiteChrome>
  );
}

function BentoTile({
  title,
  subtitle,
  href,
  accent,
  icon,
}: {
  title: string;
  subtitle: string;
  href: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:hover:bg-slate-900 ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition group-hover:scale-[1.03] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold text-brand-blue dark:text-brand-yellow">Jump →</p>
    </Link>
  );
}

function RoadmapStep({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
        {index}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function ProgressRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">{value}%</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-2 rounded-full ${accent}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function ScheduleRow({
  time,
  title,
  meta,
  pill,
}: {
  time: string;
  title: string;
  meta: string;
  pill: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{time}</p>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{meta}</p>
      </div>
      <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
        {pill}
      </span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function BadgePill({ label, tone }: { label: string; tone: "blue" | "green" | "yellow" | "neutral" }) {
  const color =
    tone === "blue"
      ? "bg-brand-blue/10 text-slate-800 dark:text-slate-100"
      : tone === "green"
        ? "bg-brand-green/10 text-slate-800 dark:text-slate-100"
        : tone === "yellow"
          ? "bg-brand-yellow/20 text-slate-900 dark:text-slate-100"
          : "bg-slate-900/5 text-slate-800 dark:bg-white/10 dark:text-slate-100";

  return (
    <div className={`rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-800 ${color}`}>
      {label}
    </div>
  );
}

function LeaderRow({
  rank,
  name,
  score,
  accent,
}: {
  rank: number;
  name: string;
  score: number;
  accent: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 place-items-center rounded-2xl text-xs font-black text-white ${accent}`}>{rank}</span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{name}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">{score.toLocaleString()} pts</p>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">This week</span>
    </div>
  );
}

function DiscussionRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{meta}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  description,
  items,
  cta,
  highlight = false,
}: {
  title: string;
  price: string;
  description: string;
  items: string[];
  cta: { href: string; label: string };
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-blue/10 via-white/70 to-brand-yellow/10 p-6 backdrop-blur dark:border-slate-800 dark:via-slate-900/40"
          : "rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/50"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{price}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {highlight && (
          <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-xs font-bold text-slate-900 dark:text-brand-yellow">
            Popular
          </span>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className="mt-1 h-2 w-2 rounded-full bg-brand-green" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <Link
          href={cta.href}
          className={
            highlight
              ? "inline-flex w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-3 text-sm font-bold text-white"
              : "inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white/60 px-4 py-3 text-sm font-bold text-slate-800 backdrop-blur dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100"
          }
        >
          {cta.label}
        </Link>
      </div>
    </div>
  );
}

function BlogCard({ title, meta, excerpt }: { title: string; meta: string; excerpt: string }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{meta}</p>
      <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{excerpt}</p>
      <p className="mt-5 text-sm font-semibold text-brand-blue dark:text-brand-yellow">Read more →</p>
    </div>
  );
}

function AboutPill({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
      <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{text}</p>
    </div>
  );
}

function AboutRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <span className="mt-1 h-2 w-2 rounded-full bg-brand-green" />
      <div>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{text}</p>
      </div>
    </div>
  );
}

function TrustMetric({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <p className="text-xs font-semibold text-slate-200">{label}</p>
    </div>
  );
}

function ProfessorCard({
  name,
  subject,
  rating,
  learners,
}: {
  name: string;
  subject: string;
  rating: string;
  learners: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="group rounded-3xl border border-slate-200 bg-white/70 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-blue/20 via-brand-yellow/10 to-brand-green/20 text-sm font-black text-slate-900 dark:text-slate-100">
            {initials}
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white">{name}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subject} mentor</p>
          </div>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
          ★ {rating}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Learners</p>
          <p className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{learners}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Style</p>
          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Clarity-first</p>
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold text-brand-blue dark:text-brand-yellow">View profile →</p>
    </div>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16v12H4z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
      <path d="M8 14h8" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M22 12h-2M12 22v-2M2 12h2" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 2l3 6 6 .9-4.5 4.3 1.1 6.3L12 17l-5.6 2.8 1.1-6.3L3 8.9 9 8l3-6z" />
    </svg>
  );
}

