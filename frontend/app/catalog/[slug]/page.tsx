"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { VideoEmbed } from "@/components/learn/video-embed";
import { SiteChrome } from "@/components/public/site-chrome";
import { api } from "@/services/api";

type Lesson = {
  id: number;
  title: string;
  duration_minutes: number;
  is_preview: boolean;
  video_url?: string | null;
  content?: string | null;
};

type Section = {
  id: number;
  title: string;
};

type PublicCourseDetail = {
  id: number;
  title: string;
  thumbnail: string | null;
  slug: string;
  description: string | null;
  price: number;
  original_price: number;
  discount_percent: number;
  is_free: boolean;
  duration_minutes: number;
  category: string | null;
  instructor: string | null;
  sections: Section[];
  lessons: Lesson[];
  total_lessons: number;
  level: string;
};

type PublicCourseDetailResponse = {
  course: PublicCourseDetail;
};

function formatAmount(amount: number) {
  return `Rs ${Number(amount).toLocaleString()}`;
}

export default function PublicCourseDetailsPage() {
  const params = useParams<{ slug: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-course-details", params.slug],
    queryFn: async () => {
      const response = await api.get<PublicCourseDetailResponse>(`/courses/catalog/${params.slug}`);
      return response.data;
    },
  });

  if (isLoading)
    return (
      <SiteChrome>
        <main className="min-h-screen p-8">Loading course details...</main>
      </SiteChrome>
    );
  if (isError || !data)
    return (
      <SiteChrome>
        <main className="min-h-screen p-8">
          <p className="rounded-lg border border-red-100 bg-red-50 p-4 text-red-700">Unable to load this course.</p>
        </main>
      </SiteChrome>
    );

  const { course } = data;

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">{course.category ?? "General"}</p>
        <div className="mt-1 h-1 w-12 rounded bg-brand-green/50">
        {course.thumbnail}</div>
        <h1 className="mt-2 text-4xl font-black text-slate-900">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{course.description ?? "Detailed information coming soon."}</p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-sm font-semibold text-brand-blue">
            {course.level}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            {course.total_lessons} lessons
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
            {course.duration_minutes} mins
          </span>
        </div>

        <div className="lms-card-ring mt-5">
          <p className="text-sm text-slate-500">Price</p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-extrabold text-brand-blue">{course.is_free ? "Free" : formatAmount(course.price)}</p>
            {!course.is_free && (
              <>
                <p className="text-sm text-slate-400 line-through">{formatAmount(course.original_price)}</p>
                <span className="rounded-full bg-brand-yellow/20 px-2 py-1 text-xs font-semibold text-slate-800">
                  {course.discount_percent}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-600">Instructor: {course.instructor ?? "LearningHun Team"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {course.is_free ? (
              <a href="#lessons" className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white">
                Start free course
              </a>
            ) : (
              <Link href="/login" className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
                Login to Enroll
              </Link>
            )}
            {!course.is_free && (
              <Link href="/register" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Create Account
              </Link>
            )}
            <Link href="/catalog" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Back to Catalog
            </Link>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2" id="lessons">
          <article className="lms-card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Sections ({course.sections.length})</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {course.sections.map((section) => (
                <li key={section.id}>• {section.title}</li>
              ))}
            </ul>
          </article>
          <article className="lms-card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Lessons ({course.lessons.length})</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {course.lessons.map((lesson) => (
                <li key={lesson.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{lesson.title}</span>
                    <span className="text-xs text-slate-500">
                      {lesson.duration_minutes} mins {lesson.is_preview ? "• Preview" : ""}
                    </span>
                  </div>
                  {course.is_free && (lesson.video_url || lesson.content) && (
                    <details className="mt-3 rounded-md bg-slate-50 p-3">
                      <summary className="cursor-pointer text-xs font-semibold text-brand-blue">
                        View lesson content
                      </summary>
                      <div className="mt-3 space-y-3 text-sm text-slate-700">
                        {lesson.video_url && <VideoEmbed url={lesson.video_url} title={lesson.title} />}
                        {lesson.content && <p className="whitespace-pre-line">{lesson.content}</p>}
                      </div>
                    </details>
                  )}
                  {!course.is_free && (
                    <p className="mt-2 text-xs text-slate-500">Login to unlock full lessons.</p>
                  )}
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </SiteChrome>
  );
}

