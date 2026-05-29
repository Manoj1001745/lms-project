"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { formatCourseAddedAt } from "@/lib/course-media";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { CourseCardData } from "@/types/course-card";

type MyCourseItem = {
  id: number;
  progress_percentage: number;
  status: string;
  enrolled_at?: string | null;
  course: {
    id: number;
    title: string;
    slug: string;
    price: string;
    duration_minutes: number;
    thumbnail_url?: string | null;
    created_at?: string | null;
    category?: { name: string } | null;
    instructor?: { name: string } | null;
  };
};

type MyCoursesResponse = {
  courses: MyCourseItem[];
};

export default function MyCoursesPage() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-courses"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<MyCoursesResponse>("/my-courses");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading your courses..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load your enrolled courses right now." tone="error" />
      </PageShell>
    );
  }

  const sortedCourses = [...data.courses].sort((a, b) => b.progress_percentage - a.progress_percentage);

  return (
    <PageShell>
      <PageHeading
        title="My Courses"
        subtitle="Track progress and continue learning from your enrollments."
        badge={`${data.courses.length} Enrollments`}
      />

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        {sortedCourses.length === 0 && (
          <div className="lms-card p-6 text-slate-600 dark:text-slate-300">
            You have no enrollments yet.{" "}
            <Link href="/courses" className="font-semibold text-brand-blue">
              Browse courses
            </Link>{" "}
            and enroll to start learning.
          </div>
        )}

        {sortedCourses.map((item) => {
          const course: CourseCardData = {
            id: item.course.id,
            title: item.course.title,
            slug: item.course.slug,
            price: item.course.price,
            is_free: Number(item.course.price) === 0,
            duration_minutes: item.course.duration_minutes,
            thumbnail_url: item.course.thumbnail_url,
            created_at: item.course.created_at,
            enrolled_at: item.enrolled_at,
            category: item.course.category,
            instructor: item.course.instructor,
            progress_percentage: item.progress_percentage,
          };

          return (
            <CourseCard
              key={item.id}
              course={course}
              detailsHref={`/courses/${item.course.slug}`}
              actionLabel="Continue Learning"
              showAddToList={false}
              showProgress
              dateLabel={formatCourseAddedAt(item.enrolled_at, "Enrolled") ?? undefined}
            />
          );
        })}
      </section>
    </PageShell>
  );
}
