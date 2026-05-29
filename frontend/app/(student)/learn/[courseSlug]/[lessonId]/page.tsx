"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { VideoEmbed } from "@/components/learn/video-embed";
import { PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type LessonPayload = {
  course: { title: string; slug: string };
  lesson: {
    id: number;
    title: string;
    content?: string | null;
    video_url?: string | null;
    duration_minutes: number;
    section?: { title: string } | null;
  };
  progress_percentage: number;
  curriculum: Array<{
    id: number;
    title: string;
    duration_minutes: number;
    is_preview: boolean;
    is_unlocked: boolean;
  }>;
  completed_lesson_ids: number[];
  previous_lesson_id: number | null;
  next_lesson_id: number | null;
};

export default function LearnLessonPage() {
  const params = useParams<{ courseSlug: string; lessonId: string }>();
  const token = useAuthStore((state) => state.token);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["lesson-details", params.courseSlug, params.lessonId],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<LessonPayload>(
        `/courses/${params.courseSlug}/lessons/${params.lessonId}`,
      );
      return response.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      await userApi.post(`/courses/${params.courseSlug}/lessons/${params.lessonId}/progress`, {
        completed: true,
      });
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setMessage("Progress saved. Great work, keep going!");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lesson-details", params.courseSlug, params.lessonId] }),
        queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["user-dashboard"] }),
      ]);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message ?? "Unable to update lesson progress.");
    },
  });

  const [isNavigatingNext, setIsNavigatingNext] = useState(false);
  const isCurrentLessonCompleted = data?.completed_lesson_ids.includes(Number(params.lessonId)) ?? false;

  const handleNextLesson = async () => {
    if (!data?.next_lesson_id) return;

    setIsNavigatingNext(true);
    setErrorMessage(null);
    try {
      await userApi.post(`/courses/${params.courseSlug}/lessons/${params.lessonId}/progress`, {
        completed: true,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["user-dashboard"] }),
      ]);
      router.push(`/learn/${data.course.slug}/${data.next_lesson_id}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message ?? "Unable to save progress for next lesson.");
    } finally {
      setIsNavigatingNext(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading lesson..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load this lesson. You may need to enroll first." tone="error" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand-blue">{data.course.title}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{data.lesson.title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Section: {data.lesson.section?.title ?? "General"} • {data.lesson.duration_minutes} mins
          </p>
          <div className="lms-card mt-3 p-4">
            <div className="flex items-center justify-between text-sm">
              <p className="font-medium text-slate-700">Current progress</p>
              <p className="font-semibold text-brand-green">{data.progress_percentage}%</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-brand-green transition-all duration-500"
                style={{ width: `${Math.max(0, Math.min(100, data.progress_percentage))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {isCurrentLessonCompleted
                ? "This lesson is already completed."
                : "Complete this lesson to unlock faster certificate progress."}
            </p>
          </div>

          <section className="lms-card mt-6 p-5">
            {data.lesson.video_url ? (
              <VideoEmbed url={data.lesson.video_url} title={data.lesson.title} />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                {data.lesson.content ?? "Lesson notes and material will appear here."}
              </div>
            )}
          </section>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending || isCurrentLessonCompleted}
              className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isCurrentLessonCompleted
                ? "Completed"
                : completeMutation.isPending
                  ? "Saving..."
                  : "Mark as Completed"}
            </button>
            {data.previous_lesson_id ? (
              <Link
                href={`/learn/${data.course.slug}/${data.previous_lesson_id}`}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Previous Lesson
              </Link>
            ) : (
              <span className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400">
                Previous Lesson
              </span>
            )}
            {data.next_lesson_id ? (
              <button
                onClick={handleNextLesson}
                disabled={isNavigatingNext}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                {isNavigatingNext ? "Saving..." : "Next Lesson"}
              </button>
            ) : (
              <span className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-400">
                Next Lesson
              </span>
            )}
            <Link
              href={`/courses/${data.course.slug}`}
              className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to Course
            </Link>
          </div>

          {message && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          {errorMessage && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}
        </div>

        <aside className="lms-card h-fit p-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Curriculum</h2>
          <ul className="mt-3 space-y-2">
            {data.curriculum.map((item) => (
              <li key={item.id}>
                {item.is_unlocked ? (
                  <Link
                    href={`/learn/${data.course.slug}/${item.id}`}
                    className={
                      item.id === data.lesson.id
                        ? "block rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white"
                        : "block rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
                    }
                  >
                    {item.title}
                    <span
                      className={
                        item.id === data.lesson.id
                          ? "ml-2 text-xs text-blue-100"
                          : "ml-2 text-xs text-slate-500"
                      }
                    >
                      {data.completed_lesson_ids.includes(item.id) ? "Completed • " : ""}
                      {item.duration_minutes} mins {item.is_preview ? "• Preview" : ""}
                    </span>
                  </Link>
                ) : (
                  <div className="block rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-500">
                    {item.title}
                    <span className="ml-2 text-xs">Locked</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}

