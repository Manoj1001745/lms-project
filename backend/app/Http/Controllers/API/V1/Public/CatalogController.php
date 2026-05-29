<?php

namespace App\Http\Controllers\API\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    public function index(): JsonResponse
    {
        $payload = Cache::remember('catalog.public', now()->addMinutes(10), function (): array {
            $courses = Course::query()
                ->with(['category:id,name', 'instructor:id,name'])
                ->where('is_published', true)
                ->latest()
                ->get();

            $featured = $courses->take(6)->map(fn (Course $course): array => $this->mapCourse($course))->values();

            return [
                'hero' => [
                    'headline' => 'Premium Competitive Learning Platform',
                    'subheadline' => 'Live classes, recorded programs, and test-ready tracks powered by LearningHun.',
                ],
                'stats' => [
                    'courses' => $courses->count(),
                    'free_courses' => $courses->where('is_free', true)->count(),
                    'paid_courses' => $courses->where('is_free', false)->count(),
                    'instructors' => $courses->pluck('instructor_id')->filter()->unique()->count(),
                ],
                'featured' => $featured,
                'browse' => $courses->map(fn (Course $course): array => $this->mapCourse($course))->values(),
            ];
        });

        return response()->json($payload);
    }

    public function show(Course $course): JsonResponse
    {
        if (! $course->is_published) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $course->load([
            'category:id,name',
            'instructor:id,name',
            'sections' => fn ($query) => $query->orderBy('sort_order'),
            'lessons' => fn ($query) => $query->orderBy('sort_order'),
        ]);

        return response()->json([
            'course' => [
                ...$this->mapCourse($course),
                'description' => $course->description,
                'sections' => $course->sections->map(fn ($section): array => [
                    'id' => $section->id,
                    'title' => $section->title,
                ])->values(),
                'lessons' => $course->lessons->map(fn ($lesson): array => [
                    'id' => $lesson->id,
                    'title' => $lesson->title,
                    'duration_minutes' => $lesson->duration_minutes,
                    'is_preview' => (bool) $lesson->is_preview,
                ])->values(),
                'total_lessons' => $course->lessons->count(),
                'level' => Str::of((string) $course->category?->name)->contains('advanced', true) ? 'Advanced' : 'Beginner-Friendly',
            ],
        ]);
    }

    private function mapCourse(Course $course): array
    {
        $price = (float) $course->price;
        $originalPrice = $course->is_free ? 0 : (float) round($price * 1.8, 2);
        $discountPercent = $course->is_free || $originalPrice <= 0
            ? 0
            : (int) round((($originalPrice - $price) / $originalPrice) * 100);

        return [
            'id' => $course->id,
            'title' => $course->title,
            'slug' => $course->slug,
            'description' => $course->description,
            'thumbnail_url' => $course->thumbnail_url,
            'created_at' => $course->created_at?->toIso8601String(),
            'price' => $price,
            'original_price' => $originalPrice,
            'discount_percent' => $discountPercent,
            'is_free' => (bool) $course->is_free,
            'duration_minutes' => $course->duration_minutes,
            'category' => $course->category?->name,
            'instructor' => $course->instructor?->name,
        ];
    }
}

