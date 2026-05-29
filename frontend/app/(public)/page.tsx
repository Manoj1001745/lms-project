"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CourseCard } from "@/components/courses/course-card";
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

function formatAmount(amount: number) {
  return `Rs ${Number(amount).toLocaleString()}`;
}

function pickCourses(courses: PublicCourse[] | undefined, keyword: RegExp) {
  return (courses ?? []).filter(
    (course) => keyword.test(course.title) || keyword.test(course.category ?? "") || keyword.test(course.description ?? ""),
  );
}

function CourseGrid({
  title,
  subtitle,
  courses,
}: {
  title: string;
  subtitle: string;
  courses: PublicCourse[];
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-slate-600">{subtitle}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {courses.slice(0, 4).map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            detailsHref={`/catalog/${course.slug}`}
            actionLabel="View Details"
            compact
          />
        ))}
      </div>
    </section>
  );
}

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

  return (
    <SiteChrome>
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-green">Live + Recorded + Test</p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            {data?.hero.headline ?? "Smart Learning Experience for Competitive Aspirants"}
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            {data?.hero.subheadline ??
              "Build momentum with structured classes, recorded paths, and performance-ready test practice."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/catalog" className="rounded-xl bg-brand-yellow px-5 py-3 text-sm font-bold text-slate-900">
              Explore Featured
            </Link>
            <Link href="/login" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700">
              Start Learning
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="lms-card-ring">
            <p className="text-sm text-slate-500">Courses</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-blue">{data?.stats.courses ?? "-"}</p>
          </div>
          <div className="lms-card-ring">
            <p className="text-sm text-slate-500">Instructors</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-green">{data?.stats.instructors ?? "-"}</p>
          </div>
          <div className="lms-card-ring">
            <p className="text-sm text-slate-500">Free Courses</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-yellow">{data?.stats.free_courses ?? "-"}</p>
          </div>
          <div className="lms-card-ring">
            <p className="text-sm text-slate-500">Paid Courses</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{data?.stats.paid_courses ?? "-"}</p>
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto w-full max-w-7xl px-6 py-6">
        <h2 className="text-2xl font-bold">Featured Courses</h2>
        <p className="mt-1 text-slate-600">Premium batches inspired by modern exam prep platforms.</p>

        {isLoading ? (
          <div className="lms-card mt-6 p-6 text-slate-600 dark:text-slate-300">Loading featured courses...</div>
        ) : isError ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            Could not load courses from API. Please check backend API URL and server.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.featured.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                detailsHref={`/catalog/${course.slug}`}
                actionLabel="View Details"
              />
            ))}
          </div>
        )}
      </section>

      {!isLoading && !isError && (
        <>
          <div id="live-courses">
            <CourseGrid
              title="Live Courses"
              subtitle="Structured classroom-style batches with disciplined schedules."
              courses={liveCourses.length > 0 ? liveCourses : data?.featured ?? []}
            />
          </div>
          <div id="recorded-courses">
            <CourseGrid
              title="Recorded Courses"
              subtitle="Self-paced premium recordings with complete syllabus coverage."
              courses={recordedCourses.length > 0 ? recordedCourses : data?.browse ?? []}
            />
          </div>
          <div id="test-series">
            <CourseGrid
              title="Test Series"
              subtitle="Exam-like practice series to boost speed, accuracy, and confidence."
              courses={testSeriesCourses.length > 0 ? testSeriesCourses : data?.featured ?? []}
            />
          </div>
          <CourseGrid
            title="Free Course"
            subtitle="Begin instantly with free learning modules and starter content."
            courses={freeCourses.length > 0 ? freeCourses : (data?.browse ?? []).slice(0, 4)}
          />
        </>
      )}

      <section id="browse" className="mx-auto w-full max-w-7xl px-6 py-10">
        <h2 className="text-2xl font-bold">Browse Catalog</h2>
        <p className="mt-1 text-sm text-slate-600">
          Want full filtering and detailed view? Open the complete catalog page.
          <Link href="/catalog" className="ml-2 font-semibold text-brand-blue">
            Go to Catalog
          </Link>
        </p>
        <div className="lms-card-ring mt-4 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {data?.browse.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-900">{course.title}</td>
                  <td className="px-4 py-3 text-slate-600">{getCategoryName(course.category)}</td>
                  <td className="px-4 py-3 text-slate-600">{course.duration_minutes} mins</td>
                  <td className="px-4 py-3 font-semibold text-brand-blue">
                    {course.is_free ? "Free" : formatAmount(course.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-4">
        <div className="rounded-2xl bg-slate-900 p-6 text-white">
          <h2 className="text-2xl font-bold">Download App</h2>
          <p className="mt-2 text-slate-300">
            Continue learning anywhere with mobile experience for classes, tests, and progress tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-slate-900"
            >
              Google Play Store
            </a>
            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-slate-900"
            >
              App Store
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <h2 className="text-2xl font-bold">About LearningHun</h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            LearningHun delivers live classes, recorded learning tracks, and outcome-focused assessments using a secure
            and scalable LMS architecture.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Inspired by top exam-prep product flows such as EverestImpact and adapted for your own brand system and
            backend APIs.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}

