"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { getApiErrorMessage } from "@/lib/api-errors";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type ProfessorRow = {
  id: number;
  name: string;
  email: string;
  status: string;
  avatar_url?: string | null;
  taught_courses_count: number;
};

type ProfessorsResponse = {
  data: ProfessorRow[];
  total: number;
  current_page: number;
  last_page: number;
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  status: "active",
  avatar_url: "",
};

export default function AdminProfessorsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/admin/login");
  }, [router, token]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, per_page: 15 };
    if (search.trim()) params.search = search.trim();
    if (status !== "all") params.status = status;
    return params;
  }, [page, search, status]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-professors", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<ProfessorsResponse>("/professors", { params: queryParams });
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string | null> = {
        name: form.name.trim(),
        email: form.email.trim(),
        status: form.status,
        avatar_url: form.avatar_url.trim() || null,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      if (editingId) {
        await adminApi.put(`/professors/${editingId}`, payload);
      } else {
        await adminApi.post("/professors", payload);
      }
    },
    onSuccess: async () => {
      setError(null);
      setMessage(editingId ? "Professor updated." : "Professor created.");
      setEditingId(null);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-courses-meta"] });
    },
    onError: (err) => {
      setMessage(null);
      setError(getApiErrorMessage(err, "Unable to save professor."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => adminApi.delete(`/professors/${id}`),
    onSuccess: async () => {
      setMessage("Professor deleted.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-professors"] });
    },
    onError: (err) => {
      setError(getApiErrorMessage(err, "Unable to delete professor."));
    },
  });

  return (
    <PageShell>
      <PageHeading
        title="Professors"
        subtitle="Manage faculty profiles and course instructors."
        badge="People"
      />

      {message && <PageMessage className="mt-4" message={message} tone="success" />}
      {error && <PageMessage className="mt-4" message={error} tone="error" />}

      <section className="lms-card mt-6 p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {editingId ? "Edit professor" : "Add professor"}
        </h2>
        <form
          className="mt-4 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
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
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="lms-input mt-1"
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="lms-input mt-1"
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            Password
            <input
              type="password"
              required={!editingId}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder={editingId ? "Leave blank to keep current" : "Minimum 8 characters"}
              className="lms-input mt-1"
            />
          </label>
          <label className="text-sm text-slate-700 dark:text-slate-200">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className="lms-input mt-1"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="md:col-span-2 text-sm text-slate-700 dark:text-slate-200">
            Avatar URL
            <input
              value={form.avatar_url}
              onChange={(event) => setForm((prev) => ({ ...prev, avatar_url: event.target.value }))}
              placeholder="https://example.com/avatar.jpg"
              className="lms-input mt-1"
            />
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : editingId ? "Update" : "Add professor"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search professors..."
          className="lms-input min-w-[220px] flex-1 text-sm"
        />
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="lms-input text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading && <PageMessage className="mt-4" message="Loading professors..." tone="loading" />}
      {isError && <PageMessage className="mt-4" message="Unable to load professors." tone="error" />}

      {data && (
        <>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{data.total} professors</p>
          <DataTable
            headers={
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Courses</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            }
          >
            {data.data.map((professor) => (
              <tr key={professor.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {professor.name}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {professor.email}
                </td>
                <td className="px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-300">
                  {professor.status}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                  {professor.taught_courses_count}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(professor.id);
                        setForm({
                          name: professor.name,
                          email: professor.email,
                          password: "",
                          status: professor.status,
                          avatar_url: professor.avatar_url ?? "",
                        });
                      }}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(professor.id)}
                      disabled={deleteMutation.isPending || professor.taught_courses_count > 0}
                      title={
                        professor.taught_courses_count > 0
                          ? "Reassign courses before deleting"
                          : "Delete"
                      }
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
                onClick={() => setPage((prev) => prev - 1)}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
              >
                Previous
              </button>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {data.current_page} of {data.last_page}
              </p>
              <button
                type="button"
                disabled={page >= data.last_page}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
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
