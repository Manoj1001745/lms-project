"use client";

import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

type PageHeadingProps = {
  title: string;
  subtitle: string;
  badge?: string;
};

type PageMessageProps = {
  message: string;
  tone?: "loading" | "error" | "empty" | "success";
  className?: string;
};

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white p-8 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

export function PageHeading({ title, subtitle, badge }: PageHeadingProps) {
  return (
    <header>
      {badge && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-blue dark:text-brand-yellow">
          {badge}
        </p>
      )}
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">{subtitle}</p>
    </header>
  );
}

export function PageMessage({ message, tone = "loading", className = "" }: PageMessageProps) {
  if (tone === "loading") {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-white p-4 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 ${className}`}
      >
        {message}
      </div>
    );
  }

  if (tone === "empty") {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 ${className}`}
      >
        {message}
      </div>
    );
  }

  if (tone === "success") {
    return (
      <div
        className={`rounded-xl border border-green-100 bg-green-50 p-4 text-green-700 dark:border-green-900/40 dark:bg-green-950/40 dark:text-green-300 ${className}`}
      >
        {message}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 ${className}`}
    >
      {message}
    </div>
  );
}
