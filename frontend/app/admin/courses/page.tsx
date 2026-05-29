"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import { DataTable, SortHeader } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type AdminCourse = {
  id: number;
  title: string;
  slug: string;
  price: string;
  is_published: boolean;
  is_free: boolean;
  duration_minutes: number;
  enrollments_count?: number;
  thumbnail_url?: string | null;
  category?: { name: string } | null;
  instructor?: { name: string } | null;
};

type AdminCoursesResponse = {
  data: AdminCourse[];
  total: number;
  current_page: number;
  last_page: number;
};

export default function AdminCoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [sortBy, setSortBy] = useState<"title" | "price" | "duration_minutes">("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== "all") params.status = statusFilter;
    return params;
  }, [page, search, statusFilter]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-courses", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<AdminCoursesResponse>("/courses", { params: queryParams });
      return response.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await adminApi.patch<{ message: string; course: AdminCourse }>(
        `/courses/${courseId}/publish`,
      );
      return response.data;
    },
    onMutate: (courseId) => {
      setTogglingId(courseId);
      setError(null);
    },
    onSuccess: async (data) => {
      setMessage(data.message);
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to update course status."));
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await adminApi.delete(`/courses/${courseId}`);
    },
    onSuccess: async () => {
      setMessage("Course deleted successfully.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to delete this course.");
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading courses..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load course management data right now." tone="error" />
      </PageShell>
    );
  }

  const sortedCourses = [...data.data].sort((a, b) => {
    if (sortBy === "price") {
      const aNum = Number(a.price);
      const bNum = Number(b.price);
      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    }

    if (sortBy === "duration_minutes") {
      return sortDirection === "asc"
        ? a.duration_minutes - b.duration_minutes
        : b.duration_minutes - a.duration_minutes;
    }

    return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
  });

  return (
    <PageShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          title="Course Management"
          subtitle={`Total courses: ${data.total}`}
          badge="Content"
        />
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white"
        >
          + Create course
        </Link>
      </div>

      {message && <PageMessage className="mt-4" message={message} tone="success" />}
      {error && <PageMessage className="mt-4" message={error} tone="error" />}

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title or slug..."
          className="lms-input min-w-[220px] flex-1 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="lms-input text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <DataTable
        headers={
          <tr>
            <th className="px-4 py-3 w-20">Thumb</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Title"
                active={sortBy === "title"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "title") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("title");
                    setSortDirection("asc");
                  }
                }}
              />
            </th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Instructor</th>
            <th className="px-4 py-3">
              <SortHeader
                label="Price"
                active={sortBy === "price"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "price") setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  else {
                    setSortBy("price");
                    setSortDirection("desc");
                  }
                }}
              />
            </th>
            <th className="px-4 py-3">
              <SortHeader
                label="Duration"
                active={sortBy === "duration_minutes"}
                direction={sortDirection}
                onClick={() => {
                  if (sortBy === "duration_minutes") {
                    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
                    setSortBy("duration_minutes");
                    setSortDirection("desc");
                  }
                }}
              />
            </th>
            <th className="px-4 py-3">Enrolled</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        }
      >
        {sortedCourses.map((course) => (
          <tr key={course.id} className="border-t border-slate-200 dark:border-slate-800">
            <td className="px-4 py-3">
              <div className="h-12 w-20 overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                <CourseThumbnail
                  thumbnailUrl={course.thumbnail_url}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  fallbackClassName="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                />
              </div>
            </td>
            <td className="px-4 py-3 font-medium">{course.title}</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{course.category?.name ?? "-"}</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{course.instructor?.name ?? "-"}</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">NPR {Number(course.price).toLocaleString()}</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{course.duration_minutes} mins</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{course.enrollments_count ?? 0}</td>
            <td className="px-4 py-3">
              <button
                type="button"
                title={course.is_published ? "Click to move to draft" : "Click to publish"}
                disabled={publishMutation.isPending && togglingId === course.id}
                onClick={() => publishMutation.mutate(course.id)}
                className={
                  course.is_published
                    ? "rounded-full bg-brand-green/10 px-2 py-1 text-xs font-semibold text-brand-green transition hover:bg-brand-green/20 disabled:opacity-60"
                    : "rounded-full bg-brand-yellow/10 px-2 py-1 text-xs font-semibold text-brand-yellow transition hover:bg-brand-yellow/20 disabled:opacity-60"
                }
              >
                {publishMutation.isPending && togglingId === course.id
                  ? "Updating..."
                  : course.is_published
                    ? "Published"
                    : "Draft"}
              </button>
            </td>
            <td className="px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Basics
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/curriculum`}
                  className="rounded-md border border-brand-blue/40 px-2 py-1 text-xs font-semibold text-brand-blue"
                >
                  Content
                </Link>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(course.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-md border border-red-800 px-2 py-1 text-xs font-semibold text-red-300 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {data.last_page > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Page {data.current_page} of {data.last_page}
          </span>
          <button
            type="button"
            disabled={page >= data.last_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
          >
            Next
          </button>
        </div>
      )}
    </PageShell>
  );
}
