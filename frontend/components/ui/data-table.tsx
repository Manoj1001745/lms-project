"use client";

import type { ReactNode } from "react";

type DataTableProps = {
  headers: ReactNode;
  children: ReactNode;
};

type SortHeaderProps = {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
};

export function DataTable({ headers, children }: DataTableProps) {
  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/80 dark:text-slate-300">{headers}</thead>
        <tbody className="text-slate-800 dark:text-slate-200">{children}</tbody>
      </table>
    </section>
  );
}

export function SortHeader({ label, active, direction, onClick }: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
    >
      <span>{label}</span>
      <span className={active ? "text-brand-blue dark:text-brand-yellow" : "opacity-40"}>
        {direction === "asc" ? "▲" : "▼"}
      </span>
    </button>
  );
}
