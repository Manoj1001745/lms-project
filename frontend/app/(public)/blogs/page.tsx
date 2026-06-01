import Link from "next/link";
import { SiteChrome } from "@/components/public/site-chrome";

const posts = [
  {
    title: "LMS progress dashboards learners actually use",
    category: "Product",
    date: "May 15, 2026",
    readTime: "5 min read",
    excerpt:
      "A quick breakdown of the UI patterns, streak nudges, and progress visuals that keep learners coming back.",
  },
  {
    title: "How we structure live + recorded learning",
    category: "Teaching",
    date: "Apr 28, 2026",
    readTime: "6 min read",
    excerpt:
      "See the pacing, handoff cues, and lesson sequencing we use to keep cohorts aligned with self-paced students.",
  },
  {
    title: "Designing quizzes that reduce anxiety",
    category: "Assessment",
    date: "Apr 10, 2026",
    readTime: "4 min read",
    excerpt:
      "Micro-tests should feel like momentum builders, not stressors. Here is the cadence that works for us.",
  },
  {
    title: "Keeping paid cohorts engaged week after week",
    category: "Growth",
    date: "Mar 30, 2026",
    readTime: "7 min read",
    excerpt:
      "We share the playbook for onboarding, reminders, and accountability loops that retain learners.",
  },
  {
    title: "From syllabus to learning journey map",
    category: "Teaching",
    date: "Mar 12, 2026",
    readTime: "5 min read",
    excerpt:
      "A visual workflow for turning a rough syllabus into a learner-friendly roadmap with milestones.",
  },
  {
    title: "Building trust with a public course catalog",
    category: "Product",
    date: "Feb 22, 2026",
    readTime: "3 min read",
    excerpt:
      "Explore the layout decisions we make so students can browse, compare, and commit fast.",
  },
];

const featured = posts[0];
const rest = posts.slice(1);

export default function BlogsPage() {
  return (
    <SiteChrome>
      <main className="bg-gradient-to-b from-white via-slate-50 to-slate-100 pb-20 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(22,163,74,0.18),_transparent_55%)]" />
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-blue/20 blur-3xl" />
          <div className="absolute -right-20 -top-10 h-64 w-64 rounded-full bg-brand-yellow/30 blur-3xl" />

          <div className="relative mx-auto w-full max-w-6xl px-6 py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-green">LMS blogs</p>
              <h1 className="font-display mt-4 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
                Ideas, playbooks, and product notes from LearningHun.
              </h1>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                Read how we design learning journeys, build student momentum, and evolve our admin workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue">Featured</p>
                <h2 className="font-display mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  {featured.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{featured.excerpt}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {featured.category} | {featured.readTime}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{featured.date}</span>
              <Link href="/contact" className="text-sm font-semibold text-brand-blue">
                Request a topic ->
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Recent posts</h3>
            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 sm:flex">
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Product</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Teaching</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Assessment</span>
              <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Growth</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <article
                key={post.title}
                className="group rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-brand-blue">
                  <span>{post.category}</span>
                  <span className="text-slate-400 dark:text-slate-500">{post.readTime}</span>
                </div>
                <h4 className="font-display mt-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {post.title}
                </h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{post.date}</span>
                  <span className="text-brand-blue">Read more -></span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 w-full max-w-6xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
                  Want LMS updates in your inbox?
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  We share product roadmaps, course design tips, and new releases twice a month.
                </p>
              </div>
              <Link href="/register" className="rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white">
                Join the list
              </Link>
            </div>
          </div>
        </section>
      </main>
    </SiteChrome>
  );
}
