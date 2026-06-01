"use client";

import Link from "next/link";
import { CourseCard } from "@/components/courses/course-card";
import { PageHeading, PageShell } from "@/components/ui/page-primitives";
import { useCourseListStore } from "@/stores/course-list.store";

export default function MyListPage() {
  const { items } = useCourseListStore();

  return (
    <PageShell>
      <PageHeading
        title="My List"
        subtitle="Courses you saved to review or buy later."
        badge={`${items.length} Saved`}
      />

      {items.length === 0 ? (
        <div className="lms-card mt-6 p-6 text-slate-600 dark:text-slate-300">
          Your list is empty.{" "}
          <Link href="/courses" className="font-semibold text-brand-blue">
            Browse courses
          </Link>{" "}
          and tap <strong>+ List</strong> on any course card.
        </div>
      ) : (
        <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              detailsHref={`/courses/${course.slug}`}
              actionLabel="View Course"
              dateLabel={
                course.saved_at
                  ? `Saved ${new Date(course.saved_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                  : undefined
              }
            />
          ))}
        </section>
      )}
    </PageShell>
  );
}
