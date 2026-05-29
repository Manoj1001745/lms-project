"use client";

import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">
      <div className="absolute right-6 top-6 z-10">
        <ThemeToggle variant="compact" />
      </div>
      {children}
    </main>
  );
}
