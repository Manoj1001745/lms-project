"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type StudentRow = {
  id: number;
  name: string;
  email: string;
  status: string;
  enrollments_count: number;
  active_enrollments_count: number;
  created_at: string;
};

type StudentsResponse = {
  data: StudentRow[];
  total: number;
  current_page: number;
  last_page: number;
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

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
    queryKey: ["admin-students", queryParams],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<StudentsResponse>("/students", { params: queryParams });
      return response.data;
    },
  });

  return (
    <PageShell>
      <PageHeading
        title="Students"
        subtitle="Monitor learners, enrollment activity, and account status."
        badge="User Management"
       
      />

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or email..."
          className="min-w-[220px] flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {isLoading && <PageMessage className="mt-4" message="Loading students..." tone="loading" />}
      {isError && <PageMessage className="mt-4" message="Unable to load students." tone="error" />}

      {data && (
        <>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{data.total} students total</p>
          <DataTable
            headers={
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Enrollments</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            }
          >
            {data.data.map((student) => (
              <tr key={student.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-3 font-medium">{student.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{student.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  {student.active_enrollments_count} active / {student.enrollments_count} total
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      student.status === "active"
                        ? "rounded-full bg-brand-green/10 px-2 py-1 text-xs font-semibold text-brand-green"
                        : "rounded-full bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-400"
                    }
                  >
                    {student.status}
                  </span>
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
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-400">
                Page {data.current_page} of {data.last_page}
              </span>
              <button
                type="button"
                disabled={page >= data.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 disabled:opacity-40"
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
