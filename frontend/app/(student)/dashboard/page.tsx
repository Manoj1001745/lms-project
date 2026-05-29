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

