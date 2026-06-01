import type { ReactNode } from "react";

type SectionShellProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  actions?: ReactNode;
};

export function SectionShell({ children, className = "", id }: SectionShellProps) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-6 py-12 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  actions,
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue dark:text-brand-yellow">
          {eyebrow}
        </p>
      )}
      <div className={align === "center" ? "" : "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"}>
        <div>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
        </div>
        {actions && <div className={align === "center" ? "mt-6 flex justify-center" : ""}>{actions}</div>}
      </div>
    </div>
  );
}
