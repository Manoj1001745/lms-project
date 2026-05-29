"use client";

import type { CourseCardData } from "@/types/course-card";
import { useCourseListStore } from "@/stores/course-list.store";

type AddToListButtonProps = {
  course: CourseCardData;
  className?: string;
};

export function AddToListButton({ course, className = "" }: AddToListButtonProps) {
  const { has, toggle } = useCourseListStore();
  const inList = has(course.id);

  return (
    <button
      type="button"
      aria-label={inList ? "Remove from my list" : "Add to my list"}
      title={inList ? "Remove from my list" : "Add to my list"}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle(course);
      }}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition ${
        inList
          ? "border-brand-blue bg-brand-blue text-white"
          : "border-white/80 bg-white/95 text-slate-800 hover:bg-white dark:border-slate-600 dark:bg-slate-900/90 dark:text-slate-100"
      } ${className}`}
    >
      {inList ? "In list" : "+ List"}
    </button>
  );
}
