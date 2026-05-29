"use client";

import { useState } from "react";
import { resolveThumbnailUrl } from "@/lib/course-media";

type CourseThumbnailProps = {
  thumbnailUrl?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
};

export function CourseThumbnail({
  thumbnailUrl,
  alt,
  className = "h-full w-full object-cover",
  fallbackClassName,
}: CourseThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveThumbnailUrl(thumbnailUrl);

  if (!src || failed) {
    return (
      <div
        className={
          fallbackClassName ??
          "flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-blue/20 to-brand-green/20 text-xs font-semibold text-slate-600 dark:text-slate-300"
        }
      >
        LearningHun
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
