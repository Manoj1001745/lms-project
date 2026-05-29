"use client";

export type LessonDraft = {
  clientId: string;
  id?: number;
  title: string;
  video_url: string;
  content: string;
  duration_minutes: string;
  is_preview: boolean;
  sort_order: number;
};

export type SectionDraft = {
  clientId: string;
  id?: number;
  title: string;
  sort_order: number;
  lessons: LessonDraft[];
};

function newClientId() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyLesson(sortOrder: number): LessonDraft {
  return {
    clientId: newClientId(),
    title: "",
    video_url: "",
    content: "",
    duration_minutes: "0",
    is_preview: false,
    sort_order: sortOrder,
  };
}

export function emptySection(sortOrder: number): SectionDraft {
  return {
    clientId: newClientId(),
    title: `Section ${sortOrder + 1}`,
    sort_order: sortOrder,
    lessons: [emptyLesson(0)],
  };
}

type CurriculumBuilderProps = {
  sections: SectionDraft[];
  onChange: (sections: SectionDraft[]) => void;
};

export function CurriculumBuilder({ sections, onChange }: CurriculumBuilderProps) {
  const updateSection = (index: number, patch: Partial<SectionDraft>) => {
    onChange(sections.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, patch: Partial<LessonDraft>) => {
    onChange(
      sections.map((section, si) => {
        if (si !== sectionIndex) return section;
        return {
          ...section,
          lessons: section.lessons.map((lesson, li) =>
            li === lessonIndex ? { ...lesson, ...patch } : lesson,
          ),
        };
      }),
    );
  };

  const addSection = () => {
    onChange([...sections, emptySection(sections.length)]);
  };

  const removeSection = (index: number) => {
    onChange(
      sections
        .filter((_, i) => i !== index)
        .map((section, sort_order) => ({ ...section, sort_order })),
    );
  };

  const addLesson = (sectionIndex: number) => {
    onChange(
      sections.map((section, si) => {
        if (si !== sectionIndex) return section;
        return {
          ...section,
          lessons: [...section.lessons, emptyLesson(section.lessons.length)],
        };
      }),
    );
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    onChange(
      sections.map((section, si) => {
        if (si !== sectionIndex) return section;
        return {
          ...section,
          lessons: section.lessons
            .filter((_, li) => li !== lessonIndex)
            .map((lesson, sort_order) => ({ ...lesson, sort_order })),
        };
      }),
    );
  };

  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => (
        <article
          key={section.clientId}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-yellow">
              Section {sectionIndex + 1}
            </h3>
            <button
              type="button"
              onClick={() => removeSection(sectionIndex)}
              disabled={sections.length === 1}
              className="text-xs font-semibold text-red-400 disabled:opacity-40"
            >
              Remove section
            </button>
          </div>

          <label className="mt-4 block text-sm text-slate-200">
            Section title
            <input
              required
              value={section.title}
              onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <div className="mt-5 space-y-4">
            {section.lessons.map((lesson, lessonIndex) => (
              <div
                key={lesson.clientId}
                className="rounded-lg border border-slate-800 bg-slate-950 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-green">
                    Lesson {lessonIndex + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLesson(sectionIndex, lessonIndex)}
                    disabled={section.lessons.length === 1}
                    className="text-xs font-semibold text-red-400 disabled:opacity-40"
                  >
                    Remove lesson
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="md:col-span-2 text-sm text-slate-200">
                    Lesson title
                    <input
                      required
                      value={lesson.title}
                      onChange={(e) =>
                        updateLesson(sectionIndex, lessonIndex, { title: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="md:col-span-2 text-sm text-slate-200">
                    Video URL
                    <input
                      value={lesson.video_url}
                      onChange={(e) =>
                        updateLesson(sectionIndex, lessonIndex, { video_url: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="text-sm text-slate-200">
                    Duration (minutes)
                    <input
                      type="number"
                      min="0"
                      value={lesson.duration_minutes}
                      onChange={(e) =>
                        updateLesson(sectionIndex, lessonIndex, {
                          duration_minutes: e.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    />
                  </label>

                  <label className="flex items-end gap-2 pb-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={lesson.is_preview}
                      onChange={(e) =>
                        updateLesson(sectionIndex, lessonIndex, { is_preview: e.target.checked })
                      }
                    />
                    Free preview lesson
                  </label>

                  <label className="md:col-span-2 text-sm text-slate-200">
                    Lesson notes / description
                    <textarea
                      rows={3}
                      value={lesson.content}
                      onChange={(e) =>
                        updateLesson(sectionIndex, lessonIndex, { content: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addLesson(sectionIndex)}
            className="mt-4 rounded-lg border border-brand-green/40 px-3 py-2 text-sm font-semibold text-brand-green"
          >
            + Add lesson
          </button>
        </article>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full rounded-lg border border-brand-blue/40 py-3 text-sm font-semibold text-brand-blue"
      >
        + Add section
      </button>
    </div>
  );
}
