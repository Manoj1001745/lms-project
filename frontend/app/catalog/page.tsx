"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "@/components/courses/course-card";
import { SiteChrome } from "@/components/public/site-chrome";
import { api } from "@/services/api";
import type { CourseCardData } from "@/types/course-card";

type CatalogResponse = {
  browse: CourseCardData[];
};

export default function PublicCatalogPage() {
  const [search, setSearch] = useState("");
  const [pricing, setPricing] = useState<"all" | "free" | "paid">("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-catalog-page"],
    queryFn: async () => {
      const response = await api.get<CatalogResponse>("/courses/catalog");
      return response.data;
    },
  });

  const filteredCourses = useMemo(() => {
    if (!data) return [];

    return data.browse.filter((course) => {
      const categoryName = typeof course.category === "string" ? course.category : course.category?.name;
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        (categoryName ?? "").toLowerCase().includes(search.toLowerCase());

      const matchesPricing =
        pricing === "all" || (pricing === "free" && course.is_free) || (pricing === "paid" && !course.is_free);

      return matchesSearch && matchesPricing;
    });
  }, [data, pricing, search]);

  return (
    <SiteChrome>
      <section className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <div className="lms-card-ring p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">Catalog</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Explore LearningHun Courses</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Browse live-quality and recorded-ready programs before enrollment.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or category..."
              className="lms-input w-full max-w-md text-sm"
            />
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value as "all" | "free" | "paid")}
              className="lms-input text-sm"
            >
              <option value="all">All Pricing</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600"
            >
              Back Home
            </Link>
          </div>
        </div>

        {isLoading && <div className="lms-card mt-6 p-5 text-slate-600 dark:text-slate-300">Loading catalog...</div>}
        {isError && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            Failed to load catalog. Check backend API connection.
          </div>
        )}

        {!isLoading && !isError && (
          <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.length === 0 && (
              <article className="lms-card md:col-span-2 xl:col-span-3 p-6 text-slate-600 dark:text-slate-300">
                No courses matched your filters.
              </article>
            )}

            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                detailsHref={`/catalog/${course.slug}`}
                actionLabel="View Details"
              />
            ))}
          </section>
        )}
      </section>
    </SiteChrome>
  );
}
