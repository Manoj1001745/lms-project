"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ThumbnailDropzone } from "@/components/admin/thumbnail-dropzone";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type CourseBasicsResponse = {
  course: {
    id: number;
    title: string;
    slug: string;
    price: string;
    is_free: boolean;
    thumbnail_url?: string | null;
  };
};

export default function EditCourseBasicsPage() {
  const params = useParams<{ id: string }>();
  const courseId = Number(params.id);
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  const courseQuery = useQuery({
    queryKey: ["admin-course-basics", courseId],
    enabled: Boolean(token) && Number.isFinite(courseId),
    queryFn: async () => {
      const response = await adminApi.get<CourseBasicsResponse>(`/courses/${courseId}`);
      return response.data.course;
    },
  });

  useEffect(() => {
    if (!courseQuery.data) return;
    setTitle(courseQuery.data.title);
    setSlug(courseQuery.data.slug);
    setPrice(String(courseQuery.data.price));
    setIsFree(courseQuery.data.is_free);
  }, [courseQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", slug.trim());
      formData.append("price", isFree ? "0" : String(Number(price) || 0));
      formData.append("is_free", isFree ? "1" : "0");
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await adminApi.put(`/courses/${courseId}/basics`, formData);
    },
    onSuccess: () => {
      setError(null);
      router.push("/admin/courses");
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to update course basics."));
    },
  });

  if (courseQuery.isLoading) {
    return <main className="min-h-screen bg-slate-950 p-8 text-slate-300">Loading...</main>;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-red-300">
        Unable to load course.
        <Link href="/admin/courses" className="mt-4 block text-brand-blue">
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-white">
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Edit course basics</h1>

        <form
          className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            setError(null);
            saveMutation.mutate();
          }}
        >
          <label className="block text-sm text-slate-200">
            Title
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Slug
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm"
            />
          </label>

          <label className="block text-sm text-slate-200">
            Price (NPR)
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={isFree}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 disabled:opacity-50"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} />
            Free course
          </label>

          <div>
            <p className="mb-2 text-sm text-slate-200">Thumbnail</p>
            <ThumbnailDropzone
              value={thumbnail}
              previewUrl={courseQuery.data.thumbnail_url}
              onChange={setThumbnail}
            />
          </div>

          {message && <p className="rounded-md bg-green-900/30 p-3 text-sm text-green-300">{message}</p>}
          {error && <p className="rounded-md bg-red-900/30 p-3 text-sm text-red-300">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex-1 rounded-lg bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : "Save basics"}
            </button>
            <Link
              href={`/admin/courses/${courseId}/curriculum`}
              className="flex-1 rounded-lg border border-slate-700 py-3 text-center text-sm font-semibold text-slate-200"
            >
              Edit content →
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
