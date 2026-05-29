import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CourseCardData } from "@/types/course-card";

type SavedCourse = CourseCardData & {
  saved_at: string;
};

type CourseListState = {
  items: SavedCourse[];
  toggle: (course: CourseCardData) => boolean;
  remove: (courseId: number) => void;
  has: (courseId: number) => boolean;
};

export const useCourseListStore = create<CourseListState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (course) => {
        const exists = get().items.some((item) => item.id === course.id);
        if (exists) {
          set({ items: get().items.filter((item) => item.id !== course.id) });
          return false;
        }

        set({
          items: [
            {
              ...course,
              saved_at: new Date().toISOString(),
            },
            ...get().items,
          ],
        });
        return true;
      },
      remove: (courseId) => set({ items: get().items.filter((item) => item.id !== courseId) }),
      has: (courseId) => get().items.some((item) => item.id === courseId),
    }),
    {
      name: "learninghun-course-list",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
