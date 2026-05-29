"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeading, PageMessage, PageShell } from "@/components/ui/page-primitives";
import { adminApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type AdminDashboardResponse = {
  revenue: {
    total: number;
    currency: string;
    this_month: number;
  };
  students: {
    total: number;
    active: number;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
    active: number;
  };
  recent_payments: Array<{
    id: number;
    transaction_id: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
    user?: { name: string; email: string } | null;
    course?: { title: string } | null;
  }>;
  recent_enrollments: Array<{
    id: number;
    status: string;
    enrolled_at?: string | null;
    created_at: string;
    user?: { name: string; email: string } | null;
    course?: { title: string } | null;
  }>;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      router.replace("/admin/login");
    }
  }, [router, token]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard"],
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await adminApi.get<AdminDashboardResponse>("/dashboard");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageMessage message="Loading dashboard..." tone="loading" />
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell>
        <PageMessage message="Unable to load admin analytics right now." tone="error" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeading
        title="Admin Dashboard"
        subtitle="Platform metrics powered by live LMS data (cached 5 min for speed)."
        badge="Operations Analytics"
      />

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={`${data.revenue.currency} ${Number(data.revenue.total).toLocaleString()}`}
          hint={`${data.revenue.currency} ${Number(data.revenue.this_month).toLocaleString()} this month`}
        />
        <StatCard label="Students" value={data.students.total} hint={`${data.students.active} active`} />
        <StatCard
          label="Courses"
          value={data.courses.total}
          hint={`${data.courses.published} live · ${data.courses.draft} draft`}
        />
        <StatCard
          label="Enrollments"
          value={data.enrollments.total}
          hint={`${data.enrollments.active} active`}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="lms-card p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/admin/courses/new" className="rounded-lg bg-brand-blue px-4 py-2 text-center text-sm font-semibold text-white">
              + New course
            </Link>
            <Link
              href="/admin/courses"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Manage courses
            </Link>
            <Link
              href="/admin/categories"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Manage categories
            </Link>
            <Link
              href="/admin/students"
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              View students
            </Link>
            <Link
              href="/admin/settings"
              className="rounded-lg border border-brand-yellow/60 px-4 py-2 text-center text-sm font-semibold text-amber-700 dark:text-brand-yellow"
            >
              Site settings
            </Link>
          </div>
        </article>

        <article className="lms-card p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent payments</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {data.recent_payments.length === 0 ? (
              <li className="text-slate-500 dark:text-slate-400">No payments yet.</li>
            ) : (
              data.recent_payments.map((payment) => (
                <li key={payment.id} className="border-b border-slate-200 pb-2 last:border-0 dark:border-slate-800">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{payment.user?.name ?? "Unknown"}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {payment.currency} {Number(payment.amount).toLocaleString()} · {payment.status}
                  </p>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="lms-card p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent enrollments</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {data.recent_enrollments.length === 0 ? (
              <li className="text-slate-500 dark:text-slate-400">No enrollments yet.</li>
            ) : (
              data.recent_enrollments.map((enrollment) => (
                <li key={enrollment.id} className="border-b border-slate-200 pb-2 last:border-0 dark:border-slate-800">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{enrollment.user?.name ?? "Unknown"}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {enrollment.course?.title ?? "Course"} · {enrollment.status}
                  </p>
                </li>
              ))
            )}
          </ul>
        </article>
      </section>
    </PageShell>
  );
}
