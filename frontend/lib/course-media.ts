import type { CourseCardData } from "@/types/course-card";

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/api\/v1\/?$/, "");

function normalizeAbsoluteThumbnailUrl(url: string): string {
  if (/^https?:\/\/localhost(?::\d+)?\//i.test(url) && !url.includes(":8000")) {
    const parsed = new URL(url);
    return `${API_ORIGIN}${parsed.pathname}${parsed.search}`;
  }
  return url;
}

export function resolveThumbnailUrl(thumbnailUrl?: string | null): string | null {
  if (!thumbnailUrl) return null;
  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return normalizeAbsoluteThumbnailUrl(thumbnailUrl);
  }
  const path = thumbnailUrl.startsWith("/") ? thumbnailUrl : `/${thumbnailUrl}`;
  return `${API_ORIGIN}${path}`;
}

export function formatCourseAddedAt(date?: string | null, prefix = "Added"): string | null {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  const diffMs = parsed.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffDays) < 1) {
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHours) < 1) return `${prefix} just now`;
    return `${prefix} ${relative.format(diffHours, "hour")}`;
  }

  if (Math.abs(diffDays) < 30) {
    return `${prefix} ${relative.format(diffDays, "day")}`;
  }

  return `${prefix} on ${parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export function getCategoryName(category?: CourseCardData["category"]): string {
  if (!category) return "General";
  return typeof category === "string" ? category : category.name;
}

export function getInstructorName(instructor?: CourseCardData["instructor"]): string {
  if (!instructor) return "LearningHun Team";
  return typeof instructor === "string" ? instructor : instructor.name;
}

export function formatCoursePrice(course: Pick<CourseCardData, "is_free" | "price">): string {
  if (course.is_free) return "Free";
  return `NPR ${Number(course.price ?? 0).toLocaleString()}`;
}
