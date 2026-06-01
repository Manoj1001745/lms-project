"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { PanelHeader } from "@/components/dashboard/panel-header";

type AdminSession = {
  name?: string;
  role?: string;
} | null;

type AdminShellProps = {
  children: ReactNode;
  session: AdminSession;
};

export function AdminShell({ children, session }: AdminShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname?.startsWith("/admin/login");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {!isLoginPage && (
        <PanelHeader
          title="Administration"
          role="admin"
          userName={session?.name}
          roleLabel={session?.role}
        />
      )}
      {children}
      {!isLoginPage && (
        <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">
            <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
              <div>
                <p className="text-lg font-bold text-brand-blue">LearningHun Admin</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Manage courses, professors, payments, and student activity from one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                <a href="/admin/dashboard" className="hover:text-brand-blue">Dashboard</a>
                <a href="/admin/courses" className="hover:text-brand-blue">Courses</a>
                <a href="/admin/categories" className="hover:text-brand-blue">Categories</a>
                <a href="/admin/professors" className="hover:text-brand-blue">Professors</a>
                <a href="/admin/payments" className="hover:text-brand-blue">Payments</a>
                <a href="/admin/settings" className="hover:text-brand-blue">Settings</a>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>Copyright 2026 LearningHun. All rights reserved.</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                Admin console
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
