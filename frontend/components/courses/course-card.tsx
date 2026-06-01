"use client";

import Link from "next/link";
import { AddToListButton } from "@/components/courses/add-to-list-button";
import { CourseThumbnail } from "@/components/courses/course-thumbnail";
import {
  formatCourseAddedAt,
  formatCoursePrice,
  getCategoryName,
  getInstructorName,
} from "@/lib/course-media";
import type { CourseCardData } from "@/types/course-card";

type CourseCardProps = {
  course: CourseCardData;
  detailsHref: string;
  actionHref?: string;
  actionLabel?: string;
  showAddToList?: boolean;
  showProgress?: boolean;
  dateLabel?: string;
  compact?: boolean;
  className?: string;
};

function formatAmount(amount: number) {
  return `Rs ${Number(amount).toLocaleString()}`;
}

export function CourseCard({
  course,
  detailsHref,
  actionHref,
  actionLabel = "View Course",
  showAddToList = true,
  showProgress = false,
  dateLabel,
  compact = false,
  className = "",
}: CourseCardProps) {
  const addedLabel =
    dateLabel ??
    (course.enrolled_at
      ? formatCourseAddedAt(course.enrolled_at, "Enrolled")
      : course.created_at
        ? formatCourseAddedAt(course.created_at, "Published")
        : null);

  return (
    <article className={`lms-card flex h-full flex-col overflow-hidden p-0 ${className}`}>
      <div className={`relative w-full overflow-hidden bg-slate-200 dark:bg-slate-800 ${compact ? "aspect-[16/10]" : "aspect-video"}`}>
        <div className="absolute inset-0">
          <CourseThumbnail
            thumbnailUrl={course.thumbnail_url}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-blue shadow dark:bg-slate-900/90 dark:text-brand-yellow">
          {getCategoryName(course.category)}
        </span>
        {showAddToList && (
          <div className="absolute right-3 top-3">
            <AddToListButton course={course} />
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <h2
          className={`mt-2 font-semibold text-slate-900 dark:text-white ${compact ? "line-clamp-2 text-base" : "text-xl"}`}
        >
          <Link href={detailsHref} className="hover:text-brand-blue dark:hover:text-brand-yellow">
            {course.title}
          </Link>
        </h2>
        {addedLabel && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{addedLabel}</p>}
        {course.description && (
          <p className={`mt-2 text-slate-600 dark:text-slate-300 ${compact ? "line-clamp-2 text-sm" : "line-clamp-3 text-sm"}`}>
            {course.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <p className={`font-bold text-brand-blue ${compact ? "text-base" : "text-lg"}`}>
            {course.original_price !== undefined && !course.is_free
              ? formatAmount(Number(course.price))
              : formatCoursePrice(course)}
          </p>
          {!course.is_free && course.original_price !== undefined && course.discount_percent !== undefined && (
            <>
              <p className="text-xs text-slate-400 line-through">{formatAmount(course.original_price)}</p>
              <span className="rounded-full bg-brand-yellow/20 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:text-brand-yellow">
                {course.discount_percent}% off
              </span>
            </>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{course.duration_minutes} mins</span>
          <span>{getInstructorName(course.instructor)}</span>
        </div>

        {showProgress && typeof course.progress_percentage === "number" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Progress</span>
              <span className="font-semibold text-brand-green">{course.progress_percentage}%</span>
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2 rounded-full bg-brand-blue"
                style={{ width: `${Math.max(0, Math.min(100, course.progress_percentage))}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={detailsHref}
            className="inline-flex rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
          >
            {actionLabel}
          </Link>
          {actionHref && actionHref !== detailsHref && (
            <Link
              href={actionHref}
              className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
