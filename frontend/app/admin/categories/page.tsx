"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { getApiErrorMessage } from "@/lib/api-errors";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  courses_count: number;
};

type CategoriesResponse = {
  data: CategoryRow[];
  total: number;
  current_page: number;
  last_page: number;
};

const emptyForm = { name: "", slug: "", description: "" };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedSlug = useMemo(() => slugify(form.name), [form.name]);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  useEffect(() => {
    if (!slugTouched && !editingId) setForm((prev) => ({ ...prev, slug: suggestedSlug }));
  }, [suggestedSlug, slugTouched, editingId]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, per_page: 20 };
    if (search.trim()) params.search = search.trim();
    return params;
  }, [page, search]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-categories", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<CategoriesResponse>("/categories", { params: queryParams });
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        slug: slugify(form.slug) || suggestedSlug,
        description: form.description.trim() || null,
      };
      if (editingId) {
        await adminApi.put(`/categories/${editingId}`, payload);
      } else {
        await adminApi.post("/categories", payload);
      }
    },
    onSuccess: async () => {
      setError(null);
      setMessage(editingId ? "Category updated." : "Category created.");
      setEditingId(null);
      setForm(emptyForm);
      setSlugTouched(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-courses-meta"] });
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to save category."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => adminApi.delete(`/categories/${id}`),
    onSuccess: async () => {
      setMessage("Category deleted.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, "Unable to delete category."));
    },
  });

  return (
    <PageShell>
      <PageHeading
        title="Categories"
        subtitle="Organize courses into categories for catalog browsing."
        badge="Content Structure"
       
      />

      {message && <PageMessage className="mt-4" message={message} tone="success" />}
      {error && <PageMessage className="mt-4" message={error} tone="error" />}

      <section className="lms-card mt-6 p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{editingId ? "Edit category" : "Add category"}</h2>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage(null);
            setError(null);
            saveMutation.mutate();
          }}
        >
          <label className="text-sm text-slate-700 dark:text-slate-200">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="lms-input mt-1"
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            Slug
            <input
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              className="lms-input mt-1 font-mono text-sm"
            />
          </label>
          <label className="md:col-span-2 text-sm text-slate-700 dark:text-slate-200">
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="lms-input mt-1"
            />
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Update" : "Add category"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setSlugTouched(false);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search categories..."
        className="lms-input mt-6 max-w-md text-sm"
      />

      {isLoading && <PageMessage className="mt-4" message="Loading categories..." tone="loading" />}
      {isError && <PageMessage className="mt-4" message="Unable to load categories." tone="error" />}

      {data && (
        <>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{data.total} categories</p>
          <DataTable
            headers={
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            }
          >
            {data.data.map((category) => (
              <tr key={category.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-medium">{category.name}</td>
                <td className="px-4 py-3 font-mono text-sm text-slate-500 dark:text-slate-400">{category.slug}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{category.courses_count}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(category.id);
                        setForm({
                          name: category.name,
                          slug: category.slug,
                          description: category.description ?? "",
                        });
                        setSlugTouched(true);
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(category.id)}
                      disabled={deleteMutation.isPending || category.courses_count > 0}
                      title={category.courses_count > 0 ? "Remove courses from this category first" : "Delete"}
                      className="rounded-md border border-red-800 px-2 py-1 text-xs font-semibold text-red-300 disabled:opacity-40"
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
        </>
      )}
    </PageShell>
  );
}
