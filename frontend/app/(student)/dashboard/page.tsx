"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { StatCard } from "@/components/dashboard/stat-card";
import type { CourseCardData } from "@/types/course-card";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type UserDashboardResponse = {
  learning: {
    enrolled_courses: number;
    completed_courses: number;
    completion_rate: number;
  };
};

type MyCourseItem = {
  id: number;
  progress_percentage: number;
  status: string;
  enrolled_at?: string | null;
  course: {
    id: number;
    title: string;
    slug: string;
    duration_minutes: number;
    thumbnail_url?: string | null;
    created_at?: string | null;
    price?: string;
    is_free?: boolean;
    category?: { name: string } | null;
    instructor?: { name: string } | null;
  };
};

type MyCoursesResponse = {
  courses: MyCourseItem[];
};

export default function StudentDashboardPage() {
  const token = useAuthStore((state) => state.token);

  const dashboardQuery = useQuery({
    queryKey: ["user-dashboard"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<UserDashboardResponse>("/dashboard");
      return response.data;
    },
  });

  const myCoursesQuery = useQuery({
    queryKey: ["my-courses-preview"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<MyCoursesResponse>("/my-courses");
      return response.data;
    },
  });

  if (dashboardQuery.isLoading || myCoursesQuery.isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading dashboard..." tone="loading" />
      </PageShell>
    );
  }

  if (dashboardQuery.isError || myCoursesQuery.isError || !dashboardQuery.data || !myCoursesQuery.data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load dashboard metrics right now." tone="error" />
      </PageShell>
    );
  }

  const continueCourses = [...myCoursesQuery.data.courses]
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 3);
  const progressHighlights = [...myCoursesQuery.data.courses]
    .sort((a, b) => b.progress_percentage - a.progress_percentage)
    .slice(0, 6);
  const averageProgress = Math.round(
    myCoursesQuery.data.courses.reduce((sum, item) => sum + item.progress_percentage, 0) /
      Math.max(1, myCoursesQuery.data.courses.length),
  );
  const activeCourses = myCoursesQuery.data.courses.filter(
    (item) => item.progress_percentage > 0 && item.progress_percentage < 100,
  ).length;
  const paidCourses = myCoursesQuery.data.courses.filter((item) => Number(item.course.price ?? 0) > 0);

  return (
    <PageShell>
      <PageHeading
        title="Student Dashboard"
        subtitle="Real-time learning progress and enrollment insights."
        badge="Learning Overview"
      />
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Enrolled Courses" value={dashboardQuery.data.learning.enrolled_courses} />
        <StatCard label="Completed Courses" value={dashboardQuery.data.learning.completed_courses} />
        <StatCard label="Completion Rate" value={`${dashboardQuery.data.learning.completion_rate}%`} />
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="lms-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Progress tracker</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                A quick visual snapshot of your top courses.
              </p>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-semibold text-brand-blue">
              Avg {averageProgress}%
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
              <div className="flex h-32 items-end gap-2">
                {progressHighlights.length === 0 && (
                  <div className="text-sm text-slate-500">No progress data yet.</div>
                )}
                {progressHighlights.map((item) => (
                  <div key={item.id} className="flex h-full flex-1 flex-col items-center gap-2">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-md bg-brand-green/80 transition-all"
                        style={{ height: `${Math.max(8, item.progress_percentage)}%` }}
                      />
                    </div>
                    <span className="max-w-[90px] truncate text-[11px] text-slate-500" title={item.course.title}>
                      {item.course.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Active tracks</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{activeCourses}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Best completion</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {progressHighlights[0]?.progress_percentage ?? 0}%
                </p>
                <p className="text-xs text-slate-500">
                  {progressHighlights[0]?.course.title ?? "Start a course to see progress."}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Next milestone</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Keep your streak alive with one lesson today.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lms-card p-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Paid courses</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Access all paid enrollments after payment is confirmed.
          </p>
          <div className="mt-4 space-y-3">
            {paidCourses.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                No paid enrollments yet. Explore premium courses to unlock them here.
              </div>
            )}
            {paidCourses.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/courses/${item.course.slug}`}
                className="block rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.course.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.progress_percentage}% completed
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-semibold text-slate-800">
                    Paid
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="lms-card mt-8 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Continue Learning</h2>
          <Link href="/my-courses" className="text-sm font-semibold text-brand-blue">
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {continueCourses.length === 0 && (
            <article className="md:col-span-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              You have not enrolled in any courses yet.{" "}
              <Link href="/courses" className="font-semibold text-brand-blue">
                Browse courses
              </Link>{" "}
              to begin your learning path.
            </article>
          )}

          {continueCourses.map((item) => {
            const course: CourseCardData = {
              id: item.course.id,
              title: item.course.title,
              slug: item.course.slug,
              duration_minutes: item.course.duration_minutes,
              thumbnail_url: item.course.thumbnail_url,
              created_at: item.course.created_at,
              enrolled_at: item.enrolled_at,
              is_free: item.course.is_free ?? false,
              price: item.course.price,
              category: item.course.category,
              instructor: item.course.instructor,
              progress_percentage: item.progress_percentage,
            };

            return (
              <CourseCard
                key={item.id}
                course={course}
                detailsHref={`/courses/${item.course.slug}`}
                actionLabel="Continue"
                showAddToList={false}
                showProgress
                compact
              />
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

