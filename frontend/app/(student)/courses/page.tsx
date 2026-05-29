"use client";

import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "@/components/courses/course-card";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { CourseCardData } from "@/types/course-card";

type CourseListResponse = {
  data: CourseCardData[];
};

export default function CoursesPage() {
  const token = useAuthStore((state) => state.token);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["courses"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<CourseListResponse>("/courses");
      return response.data;
    },
  });

  if (isLoading)
    return (
      <PageShell>
        <PageMessage message="Loading courses..." tone="loading" />
      </PageShell>
    );
  if (isError || !data)
    return (
      <PageShell>
        <PageMessage message="Unable to load courses." tone="error" />
      </PageShell>
    );

  return (
    <PageShell>
      <PageHeading
        title="Browse Courses"
        subtitle="Explore professional learning tracks and enroll instantly."
        badge="Course Catalog"
      />

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data.data.length === 0 && (
          <div className="md:col-span-2 xl:col-span-3">
            <PageMessage message="No published courses found yet." tone="empty" />
          </div>
        )}
        {data.data.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              ...course,
              category: course.category ?? null,
              instructor: course.instructor ?? null,
            }}
            detailsHref={`/courses/${course.slug}`}
            actionLabel="View Course"
          />
        ))}
      </section>
    </PageShell>
  );
}
