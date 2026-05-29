"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { getApiErrorMessage } from "@/lib/api-errors";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ThumbnailDropzone } from "@/components/admin/thumbnail-dropzone";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewCoursePage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [price, setPrice] = useState("0");
  const [isFree, setIsFree] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => slugify(title), [title]);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  useEffect(() => {
    if (!slugTouched) setSlug(suggestedSlug);
  }, [suggestedSlug, slugTouched]);

  const createMutation = useMutation({
    mutationFn: async (normalizedSlug: string) => {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("slug", normalizedSlug);
      formData.append("price", isFree ? "0" : String(Number(price) || 0));
      formData.append("is_free", isFree ? "1" : "0");
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const response = await adminApi.post<{ course: { id: number } }>("/courses", formData);
      return response.data.course;
    },
    onSuccess: (course) => {
      router.push(`/admin/courses/${course.id}/curriculum`);
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, "Unable to create course."));
    },
  });

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/courses" className="text-sm text-slate-400 hover:text-white">
          ← Back to courses
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Create course — Step 1</h1>
        <p className="mt-2 text-slate-400">Basics only. You will add lessons and content in the next step.</p>

        <form
          className="mt-8 space-y-5 rounded-xl border border-slate-800 bg-slate-900 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);

            const normalizedSlug = slugify(slug);
            if (!normalizedSlug) {
              setError("Please enter a valid slug for this course.");
              return;
            }

            if (!slugTouched || slug !== normalizedSlug) {
              setSlug(normalizedSlug);
            }

            createMutation.mutate(normalizedSlug);
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
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-slate-500">URL: /courses/{slug || "your-slug"}</span>
          </label>

          <label className="block text-sm text-slate-200">
            Price (NPR)
            <input
              type="number"
              min="0"
              step="0.01"
              disabled={isFree}
              required={!isFree}
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
            <ThumbnailDropzone value={thumbnail} onChange={setThumbnail} />
          </div>

          {error && <p className="rounded-md bg-red-900/30 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-lg bg-brand-blue py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {createMutation.isPending ? "Creating..." : "Create & continue to curriculum →"}
          </button>
        </form>
      </div>
    </main>
  );
}
