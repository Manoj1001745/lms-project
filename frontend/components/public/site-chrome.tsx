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
  { href: "/about", label: "About" },
  { href: "/catalog", label: "Catalog" },
  { href: "/blogs", label: "Blogs" },
  { href: "/contact", label: "Contact" },
];

export function SiteChrome({ children }: SiteChromeProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeHref = useMemo(() => {
    if (pathname?.startsWith("/about")) return "/about";
    if (pathname?.startsWith("/catalog")) return "/catalog";
    if (pathname?.startsWith("/blogs")) return "/blogs";
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

      <footer className="mt-12 border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-extrabold text-brand-blue">LearningHun</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Smooth learning web application with live classes, recorded tracks, and assessments.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                  Live cohorts
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                  Recorded tracks
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                  Progress dashboards
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  aria-label="Facebook"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue hover:text-brand-blue dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M15.12 8.6h2.24V5.5h-2.58c-2.64 0-4.32 1.6-4.32 4.36v1.84H8v3.1h2.46V22h3.02v-7.2h2.52l.42-3.1h-2.94V9.98c0-.9.46-1.38 1.64-1.38z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue hover:text-brand-blue dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zm0 2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6zM17.6 6.4a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  aria-label="LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue hover:text-brand-blue dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M6.94 8.5V21H3.6V8.5h3.34zm-1.66-5a1.93 1.93 0 1 1-.02 3.86 1.93 1.93 0 0 1 .02-3.86zM20.5 12.8V21h-3.32v-7.2c0-1.8-.64-3.02-2.24-3.02-1.22 0-1.94.82-2.26 1.6-.12.28-.14.66-.14 1.04V21h-3.32s.04-11.46 0-12.5h3.32v1.78c.44-.68 1.22-1.64 2.96-1.64 2.16 0 3.78 1.4 3.78 4.16z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  aria-label="YouTube"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-brand-blue hover:text-brand-blue dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M21.6 8.2a3 3 0 0 0-2.1-2.1C17.8 5.6 12 5.6 12 5.6s-5.8 0-7.5.5a3 3 0 0 0-2.1 2.1A31.1 31.1 0 0 0 2 12a31.1 31.1 0 0 0 .4 3.8 3 3 0 0 0 2.1 2.1c1.7.5 7.5.5 7.5.5s5.8 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.1 31.1 0 0 0 22 12a31.1 31.1 0 0 0-.4-3.8zM10 15.2V8.8l5.6 3.2L10 15.2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/about" className="hover:text-brand-blue">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:text-brand-blue">
                    Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-blue">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Explore</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/catalog" className="hover:text-brand-blue">
                    Course catalog
                  </Link>
                </li>
                <li>
                  <Link href="/blogs" className="hover:text-brand-blue">
                    Product updates
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-blue">
                    Partner with us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Account</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-brand-blue">
                    Student login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-brand-blue">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-brand-blue">
                    Admin login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center">
            <p>Copyright 2026 LearningHun. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                Built for focus
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                Secure payments
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 dark:border-slate-800 dark:bg-slate-950">
                Mobile ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
