"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type Lesson = {
  id: number;
  title: string;
  duration_minutes: number;
  is_preview: boolean;
};

type Section = {
  id: number;
  title: string;
};

type CourseDetails = {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price: string;
  is_free: boolean;
  duration_minutes: number;
  instructor?: { name: string } | null;
  category?: { name: string } | null;
  sections: Section[];
  lessons: Lesson[];
};

type CourseDetailsResponse = {
  course: CourseDetails;
  is_enrolled: boolean;
};

type PaymentIntentResponse = {
  payment: {
    transaction_id: string;
  };
  checkout_url?: string | null;
};

export default function CourseDetailsPage() {
  const params = useParams<{ slug: string }>();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["course-details", params.slug],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.get<CourseDetailsResponse>(`/courses/${params.slug}`);
      return response.data;
    },
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await userApi.post(`/courses/${params.slug}/enroll`);
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setMessage("Enrollment successful. This course is now in your learning dashboard.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["course-details", params.slug] }),
        queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["user-dashboard"] }),
      ]);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      setErrorMessage(axiosError.response?.data?.message ?? "Enrollment failed. Please retry.");
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const intentResponse = await userApi.post<PaymentIntentResponse>(
        `/courses/${params.slug}/payments/initiate`,
        {
          gateway: "stripe",
          idempotency_key: idempotencyKey,
        },
      );

      const checkoutUrl = intentResponse.data.checkout_url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      const transactionId = intentResponse.data.payment.transaction_id;
      await userApi.post(`/courses/${params.slug}/payments/confirm`, {
        transaction_id: transactionId,
        status: "paid",
      });
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setMessage("Payment successful. You are now enrolled in this course.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["course-details", params.slug] }),
        queryClient.invalidateQueries({ queryKey: ["my-courses"] }),
        queryClient.invalidateQueries({ queryKey: ["user-dashboard"] }),
      ]);
    },
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string; details?: string }>;
      const details = axiosError.response?.data?.details;
      const base = axiosError.response?.data?.message ?? "Payment failed. Please retry.";
      setErrorMessage(details ? `${base} (${details})` : base);
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading course details..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load this course." tone="error" />
      </PageShell>
    );
  }

  const { course } = data;

  return (
    <PageShell>
      <div className="relative aspect-video w-full max-h-80 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
        <CourseThumbnail
          thumbnailUrl={course.thumbnail_url}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-6">
      <PageHeading
        title={course.title}
        subtitle={course.description ?? "Detailed course information coming soon."}
        badge={course.category?.name ?? "General"}
      />
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Instructor: {course.instructor?.name ?? "Unknown Instructor"} • {course.duration_minutes} mins
      </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!data.is_enrolled ? (
            course.is_free ? (
              <button
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                className="rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {enrollMutation.isPending ? "Enrolling..." : "Enroll Free"}
              </button>
            ) : (
              <button
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isPending}
                className="rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
              >
                {purchaseMutation.isPending
                  ? "Processing Payment..."
                  : `Buy Now - NPR ${Number(course.price).toLocaleString()}`}
              </button>
            )
          ) : (
            <Link
              href="/my-courses"
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
            >
              Go to My Courses
            </Link>
          )}
          <Link href="/courses" className="rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700">
            Back to Courses
          </Link>
        </div>

        {message && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        {errorMessage && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>}

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="lms-card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Sections ({course.sections.length})</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {course.sections.map((section) => (
                <li key={section.id}>• {section.title}</li>
              ))}
            </ul>
          </div>
          <div className="lms-card p-5">
            <h2 className="text-lg font-semibold text-slate-900">Lessons ({course.lessons.length})</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {course.lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center justify-between gap-3">
                  <span>{lesson.title}</span>
                  <span className="text-xs text-slate-500">
                    {lesson.duration_minutes} mins {lesson.is_preview ? "• Preview" : ""}
                  </span>
                  {data.is_enrolled || lesson.is_preview ? (
                    <Link
                      href={`/learn/${course.slug}/${lesson.id}`}
                      className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Open
                    </Link>
                  ) : (
                    <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      Locked
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
    </PageShell>
  );
}

