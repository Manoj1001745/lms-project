<?php

namespace App\Http\Controllers\API\V1\User;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->select([
                'id',
                'title',
                'slug',
                'description',
                'thumbnail_url',
                'price',
                'is_free',
                'duration_minutes',
                'category_id',
                'instructor_id',
                'created_at',
            ])
            ->with(['category:id,name', 'instructor:id,name'])
            ->where('is_published', true)
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $query->where('title', 'like', '%'.$request->string('search')->value().'%');
            })
            ->latest()
            ->paginate(12);

        return response()->json($courses);
    }

    public function show(Course $course): JsonResponse
    {
        if (! $course->is_published) {
            return response()->json(['message' => 'Course is not available.'], 404);
        }

        $isEnrolled = Enrollment::query()
            ->where('user_id', request()->user()->id)
            ->where('course_id', $course->id)
            ->exists();

        return response()->json([
            'course' => $course->load([
                'category:id,name',
                'instructor:id,name',
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'lessons' => fn ($query) => $query->orderBy('sort_order'),
            ]),
            'is_enrolled' => $isEnrolled,
        ]);
    }

    public function myCourses(Request $request): JsonResponse
    {
        $enrollments = Enrollment::query()
            ->with([
                'course:id,title,slug,price,is_free,is_published,duration_minutes,thumbnail_url,created_at',
                'course.category:id,name',
                'course.instructor:id,name',
            ])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'courses' => $enrollments,
        ]);
    }

    public function enroll(Request $request, Course $course): JsonResponse
    {
        if (! $course->is_published) {
            return response()->json(['message' => 'This course is not currently available.'], 422);
        }

        if (! $course->is_free) {
            return response()->json([
                'message' => 'This is a paid course. Complete payment before enrollment.',
            ], 422);
        }

        $enrollment = Enrollment::query()->firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'course_id' => $course->id,
            ],
            [
                'enrolled_at' => now(),
                'status' => 'active',
                'progress_percentage' => 0,
            ]
        );

        return response()->json([
            'message' => 'Enrollment successful.',
            'enrollment' => $enrollment->load('course:id,title,slug'),
        ]);
    }

    public function lesson(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        if ($lesson->course_id !== $course->id) {
            return response()->json(['message' => 'Lesson does not belong to this course.'], 404);
        }

        $enrollment = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        $isUnlocked = $lesson->is_preview || $course->is_free || (bool) $enrollment;

        if (! $isUnlocked) {
            return response()->json(['message' => 'Enroll in this course to access this lesson.'], 403);
        }

        $curriculumLessons = Lesson::query()
            ->where('course_id', $course->id)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'title', 'duration_minutes', 'is_preview', 'sort_order']);

        $completedLessonIds = DB::table('lesson_progress')
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->where('is_completed', true)
            ->pluck('lesson_id')
            ->all();

        $currentIndex = $curriculumLessons->search(fn (Lesson $item) => $item->id === $lesson->id);
        $previousLessonId = $currentIndex !== false && $currentIndex > 0
            ? $curriculumLessons[$currentIndex - 1]->id
            : null;
        $nextLessonId = $currentIndex !== false && $currentIndex < ($curriculumLessons->count() - 1)
            ? $curriculumLessons[$currentIndex + 1]->id
            : null;

        return response()->json([
            'course' => $course->only(['id', 'title', 'slug']),
            'lesson' => $lesson->load('section:id,title'),
            'is_unlocked' => true,
            'progress_percentage' => $enrollment?->progress_percentage ?? 0,
            'curriculum' => $curriculumLessons->map(function (Lesson $item) use ($enrollment, $course): array {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'duration_minutes' => $item->duration_minutes,
                    'is_preview' => $item->is_preview,
                    'is_unlocked' => $item->is_preview || $course->is_free || (bool) $enrollment,
                ];
            })->values(),
            'completed_lesson_ids' => $completedLessonIds,
            'previous_lesson_id' => $previousLessonId,
            'next_lesson_id' => $nextLessonId,
        ]);
    }

    public function updateProgress(Request $request, Course $course, Lesson $lesson): JsonResponse
    {
        $payload = $request->validate([
            'completed' => ['required', 'boolean'],
        ]);

        if ($lesson->course_id !== $course->id) {
            return response()->json(['message' => 'Lesson does not belong to this course.'], 404);
        }

        $enrollment = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment && $course->is_free) {
            $enrollment = Enrollment::query()->firstOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'course_id' => $course->id,
                ],
                [
                    'enrolled_at' => now(),
                    'status' => 'active',
                    'progress_percentage' => 0,
                ]
            );
        }

        if (! $enrollment) {
            return response()->json(['message' => 'Enroll in this course before updating progress.'], 403);
        }

        DB::table('lesson_progress')->updateOrInsert(
            [
                'user_id' => $request->user()->id,
                'course_id' => $course->id,
                'lesson_id' => $lesson->id,
            ],
            [
                'is_completed' => $payload['completed'],
                'completed_at' => $payload['completed'] ? now() : null,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $totalLessons = max(1, Lesson::query()->where('course_id', $course->id)->count());
        $completedLessons = DB::table('lesson_progress')
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->where('is_completed', true)
            ->count();

        $enrollment->progress_percentage = (int) round(($completedLessons / $totalLessons) * 100);
        $enrollment->save();

        if ($enrollment->progress_percentage >= 100) {
            Certificate::query()->firstOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'course_id' => $course->id,
                ],
                [
                    'certificate_no' => 'LH-CERT-'.Str::upper(Str::random(10)),
                    'issued_at' => now(),
                ]
            );
        }

        return response()->json([
            'message' => 'Progress updated successfully.',
            'progress_percentage' => $enrollment->progress_percentage,
        ]);
    }
}

