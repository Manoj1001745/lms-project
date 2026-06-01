"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CurriculumBuilder,
  emptyLesson,
  emptySection,
  type SectionDraft,
} from "@/components/admin/curriculum-builder";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type CourseMetaResponse = {
  categories: Array<{ id: number; name: string }>;
  instructors: Array<{ id: number; name: string; email: string }>;
};

type LessonApi = {
  id: number;
  section_id: number;
  title: string;
  video_url?: string | null;
  content?: string | null;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
};

type SectionApi = {
  id: number;
  title: string;
  sort_order: number;
};

type CourseDetailsResponse = {
  course: {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    resource_pdf_url?: string | null;
    category_id?: number | null;
    instructor_id?: number | null;
    mcq_count?: number;
    mcq_pass_mark?: number;
    is_published: boolean;
    sections: SectionApi[];
    lessons: LessonApi[];
  };
};

function mapToDrafts(sections: SectionApi[], lessons: LessonApi[]): SectionDraft[] {
  if (sections.length === 0) {
    return [emptySection(0)];
  }

  return sections
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section, sectionIndex) => ({
      clientId: `s-${section.id}`,
      id: section.id,
      title: section.title,
      sort_order: section.sort_order ?? sectionIndex,
      lessons: lessons
        .filter((lesson) => lesson.section_id === section.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((lesson, lessonIndex) => ({
          clientId: `l-${lesson.id}`,
          id: lesson.id,
          title: lesson.title,
          video_url: lesson.video_url ?? "",
          content: lesson.content ?? "",
          duration_minutes: String(lesson.duration_minutes ?? 0),
          is_preview: lesson.is_preview,
          sort_order: lesson.sort_order ?? lessonIndex,
        })),
    }))
    .map((section) => ({
      ...section,
      lessons: section.lessons.length > 0 ? section.lessons : [emptyLesson(0)],
    }));
}

function toCurriculumPayload(sections: SectionDraft[]) {
  return {
    sections: sections.map((section, sectionIndex) => ({
      ...(section.id ? { id: section.id } : {}),
      title: section.title.trim(),
      sort_order: sectionIndex,
      lessons: section.lessons
        .filter((lesson) => lesson.title.trim())
        .map((lesson, lessonIndex) => ({
          ...(lesson.id ? { id: lesson.id } : {}),
          title: lesson.title.trim(),
          video_url: lesson.video_url.trim() || null,
          content: lesson.content.trim() || null,
          duration_minutes: Number(lesson.duration_minutes) || 0,
          is_preview: lesson.is_preview,
          sort_order: lessonIndex,
        })),
    })),
  };
}

function validateCurriculum(sections: SectionDraft[]): string | null {
  for (const [sectionIndex, section] of sections.entries()) {
    if (!section.title.trim()) {
      return `Section ${sectionIndex + 1} needs a title.`;
    }

    const lessonsWithTitle = section.lessons.filter((lesson) => lesson.title.trim());
    if (lessonsWithTitle.length === 0) {
      return `Section "${section.title || sectionIndex + 1}" needs at least one lesson with a title.`;
    }
  }

  return null;
}

export default function CourseCurriculumPage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const [description, setDescription] = useState("");
  const [resourcePdfUrl, setResourcePdfUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [mcqCount, setMcqCount] = useState("0");
  const [mcqPassMark, setMcqPassMark] = useState("0");
  const [isPublished, setIsPublished] = useState(false);
  const [sections, setSections] = useState<SectionDraft[]>([emptySection(0)]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  const metaQuery = useQuery({
    queryKey: ["admin-courses-meta"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<CourseMetaResponse>("/courses/meta");
      return response.data;
    },
  });

  const courseQuery = useQuery({
    queryKey: ["admin-course", courseId],
    enabled: Boolean(token) && Number.isFinite(courseId),
    queryFn: async () => {
      const response = await adminApi.get<CourseDetailsResponse>(`/courses/${courseId}`);
      return response.data.course;
    },
  });

  useEffect(() => {
    if (!courseQuery.data) return;
    const course = courseQuery.data;
    setDescription(course.description ?? "");
    setResourcePdfUrl(course.resource_pdf_url ?? "");
    setCategoryId(course.category_id ? String(course.category_id) : "");
    setInstructorId(course.instructor_id ? String(course.instructor_id) : "");
    setMcqCount(String(course.mcq_count ?? 0));
    setMcqPassMark(String(course.mcq_pass_mark ?? 0));
    setIsPublished(course.is_published);
    setSections(mapToDrafts(course.sections ?? [], course.lessons ?? []));
  }, [courseQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await adminApi.put(`/courses/${courseId}/details`, {
        description: description.trim() || null,
        resource_pdf_url: resourcePdfUrl.trim() || null,
        category_id: categoryId ? Number(categoryId) : null,
        instructor_id: instructorId ? Number(instructorId) : null,
        mcq_count: Number(mcqCount) || 0,
        mcq_pass_mark: Number(mcqPassMark) || 0,
        is_published: isPublished,
      });
      await adminApi.put(`/courses/${courseId}/curriculum`, toCurriculumPayload(sections));
    },
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-course", courseId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      router.push("/admin/courses");
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to save course content."));
    },
  });

  if (courseQuery.isLoading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading course...</main>;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <p className="text-red-300">Unable to load this course.</p>
        <Link href="/admin/courses" className="mt-4 inline-block text-brand-blue">
          Back to courses
        </Link>
      </main>
    );
  }

  const course = courseQuery.data;
  const totalLessons = sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-white">
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Course content — Step 2</h1>
        <p className="mt-2 text-slate-400">
          <span className="text-white">{course.title}</span> · {totalLessons} lesson
          {totalLessons === 1 ? "" : "s"} across {sections.length} section
          {sections.length === 1 ? "" : "s"}
        </p>

        <form
          className="mt-8 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            setError(null);

            const validationError = validateCurriculum(sections);
            if (validationError) {
              setError(validationError);
              return;
            }

            saveMutation.mutate();
          }}
        >
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Course details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2 text-sm text-slate-200">
                Description
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              <label className="md:col-span-2 text-sm text-slate-200">
                Resource PDF URL
                <input
                  value={resourcePdfUrl}
                  onChange={(e) => setResourcePdfUrl(e.target.value)}
                  placeholder="https://example.com/outline.pdf"
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              <label className="text-sm text-slate-200">
                Category
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {metaQuery.data?.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-200">
                Instructor
                <select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                >
                  <option value="">None</option>
                  {metaQuery.data?.instructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-200">
                MCQ count
                <input
                  type="number"
                  min="0"
                  value={mcqCount}
                  onChange={(e) => setMcqCount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              <label className="text-sm text-slate-200">
                MCQ pass mark
                <input
                  type="number"
                  min="0"
                  value={mcqPassMark}
                  onChange={(e) => setMcqPassMark(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Publish course
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Curriculum by lesson</h2>
            <p className="mt-1 text-sm text-slate-400">
              Organize videos into sections. Each lesson can have its own video URL.
            </p>
            <div className="mt-6">
              <CurriculumBuilder sections={sections} onChange={setSections} />
            </div>
          </section>

          {message && <p className="rounded-md bg-green-900/30 p-3 text-sm text-green-300">{message}</p>}
          {error && <p className="rounded-md bg-red-900/30 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="w-full rounded-lg bg-brand-green py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving..." : "Save course content"}
          </button>
        </form>
      </div>
    </main>
  );
}
