<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\PlatformCache;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseCurriculumController extends Controller
{
    public function updateDetails(Request $request, Course $course): JsonResponse
    {
        $payload = $request->validate([
            'description' => ['nullable', 'string'],
            'resource_pdf_url' => ['nullable', 'url', 'max:2048'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'instructor_id' => ['nullable', 'exists:users,id'],
            'mcq_count' => ['sometimes', 'integer', 'min:0'],
            'mcq_pass_mark' => ['sometimes', 'integer', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $course->update($payload);
        PlatformCache::bustCourse($course->slug);

        return response()->json([
            'message' => 'Course details updated successfully.',
            'course' => $course->fresh()->load(['category:id,name', 'instructor:id,name']),
        ]);
    }

    public function syncCurriculum(Request $request, Course $course): JsonResponse
    {
        $payload = $request->validate([
            'sections' => ['required', 'array'],
            'sections.*.id' => ['nullable', 'integer'],
            'sections.*.title' => ['required', 'string', 'max:255'],
            'sections.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'sections.*.lessons' => ['sometimes', 'array'],
            'sections.*.lessons.*.id' => ['nullable', 'integer'],
            'sections.*.lessons.*.title' => ['required', 'string', 'max:255'],
            'sections.*.lessons.*.video_url' => ['nullable', 'url', 'max:2048'],
            'sections.*.lessons.*.content' => ['nullable', 'string'],
            'sections.*.lessons.*.duration_minutes' => ['sometimes', 'integer', 'min:0'],
            'sections.*.lessons.*.is_preview' => ['sometimes', 'boolean'],
            'sections.*.lessons.*.sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        DB::transaction(function () use ($course, $payload): void {
            $keptSectionIds = [];
            $keptLessonIds = [];
            $totalDuration = 0;

            foreach ($payload['sections'] as $sectionIndex => $sectionData) {
                $section = ! empty($sectionData['id'])
                    ? Section::query()->where('course_id', $course->id)->findOrFail($sectionData['id'])
                    : new Section(['course_id' => $course->id]);

                $section->title = $sectionData['title'];
                $section->sort_order = $sectionData['sort_order'] ?? $sectionIndex;
                $section->save();
                $keptSectionIds[] = $section->id;

                foreach ($sectionData['lessons'] ?? [] as $lessonIndex => $lessonData) {
                    $lesson = ! empty($lessonData['id'])
                        ? Lesson::query()
                            ->where('course_id', $course->id)
                            ->where('section_id', $section->id)
                            ->findOrFail($lessonData['id'])
                        : new Lesson([
                            'course_id' => $course->id,
                            'section_id' => $section->id,
                        ]);

                    $lesson->title = $lessonData['title'];
                    $lesson->video_url = $lessonData['video_url'] ?? null;
                    $lesson->content = $lessonData['content'] ?? null;
                    $lesson->duration_minutes = $lessonData['duration_minutes'] ?? 0;
                    $lesson->is_preview = $lessonData['is_preview'] ?? false;
                    $lesson->sort_order = $lessonData['sort_order'] ?? $lessonIndex;
                    $lesson->save();

                    $keptLessonIds[] = $lesson->id;
                    $totalDuration += (int) $lesson->duration_minutes;
                }
            }

            Lesson::query()
                ->where('course_id', $course->id)
                ->whereNotIn('id', $keptLessonIds)
                ->delete();

            Section::query()
                ->where('course_id', $course->id)
                ->whereNotIn('id', $keptSectionIds)
                ->delete();

            $course->update(['duration_minutes' => $totalDuration]);
        });

        PlatformCache::bustCourse($course->slug);

        return response()->json([
            'message' => 'Curriculum saved successfully.',
            'course' => $course->fresh()->load([
                'category:id,name',
                'instructor:id,name',
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'lessons' => fn ($query) => $query->orderBy('sort_order'),
            ]),
        ]);
    }
}
