"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/contact", label: "Contact" },
];

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeHref = useMemo(() => {
    if (pathname?.startsWith("/catalog")) return "/catalog";
    if (pathname?.startsWith("/contact")) return "/contact";
    return "/";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-extrabold text-brand-blue">
            LearningHun
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  activeHref === item.href
                    ? "text-sm font-semibold text-brand-blue"
                    : "text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle variant="compact" />
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Login
            </Link>
            <Link href="/register" className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
              Join Now
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle variant="compact" />
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    activeHref === item.href
                      ? "text-sm font-semibold text-brand-blue"
                      : "text-sm font-medium text-slate-700 dark:text-slate-300"
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link href="/register" className="rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white">
                  Join Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <div>{children}</div>

      <footer className="mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-brand-blue">LearningHun</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Smooth learning web application with live classes, recorded tracks, and assessments.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="/catalog">Catalog</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/login">Student Login</Link>
            <Link href="/admin/login">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
