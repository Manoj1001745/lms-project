"use client";

import { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { adminApi, userApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

type PanelHeaderProps = {
  title: string;
  role: "admin" | "student";
  userName?: string;
  roleLabel?: string;
};

export function PanelHeader({ title, role, userName, roleLabel }: PanelHeaderProps) {
  const router = useRouter();
  const { clearSession } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const links =
    role === "admin"
      ? [
          { href: "/admin/dashboard", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { href: "/admin/categories", label: "Categories" },
          { href: "/admin/payments", label: "Payments" },
          { href: "/admin/students", label: "Students" },
          { href: "/admin/settings", label: "Settings" },
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/courses", label: "Browse" },
          { href: "/my-list", label: "My List" },
          { href: "/my-courses", label: "My Courses" },
          { href: "/payments", label: "Payments" },
          { href: "/certificates", label: "Certificates" },
          { href: "/profile", label: "Profile" },
        ];

  const formattedRoleLabel = roleLabel
    ? roleLabel
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : undefined;

  const initials = (userName ?? "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (role === "admin") {
        await adminApi.post("/logout");
        clearSession();
        router.push("/admin/login");
      } else {
        await userApi.post("/logout");
        clearSession();
        router.push("/login");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      window.alert(axiosError.response?.data?.message ?? "Logout failed, please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={
              role === "admin"
                ? "grid h-10 w-10 place-items-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-brand-blue dark:border-slate-700 dark:bg-slate-800 dark:text-brand-yellow"
                : "grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-sm font-semibold text-brand-blue dark:border-blue-900 dark:bg-blue-950/50"
            }
          >
            {initials}
          </div>
          <div>
            <p
              className={
                role === "admin"
                  ? "text-xs uppercase tracking-wide text-brand-blue dark:text-brand-yellow"
                  : "text-xs uppercase tracking-wide text-brand-blue"
              }
            >
              {role === "admin" ? "Admin Panel" : "Student Panel"}
            </p>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
            {(userName || roleLabel) && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userName ?? "Authenticated User"} {formattedRoleLabel ? `(${formattedRoleLabel})` : ""}
              </p>
            )}
          </div>
        </div>
        <nav className="hidden gap-4 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="compact" />
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className={
              role === "admin"
                ? "rounded-lg bg-brand-yellow px-3 py-2 text-sm font-semibold text-slate-900 disabled:opacity-60"
                : "rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
            }
          >
            {isLoading ? "Signing out..." : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}
