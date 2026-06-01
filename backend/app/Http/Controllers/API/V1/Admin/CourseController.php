<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\PlatformCache;
use App\Models\Category;
use App\Models\Course;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    public function meta(): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');

        $categories = Category::query()
            ->orderBy('name')
            ->get(['id', 'name']);

        $instructors = User::query()
            ->when($professorRoleId, fn ($query) => $query->where('role_id', $professorRoleId))
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json([
            'categories' => $categories,
            'instructors' => $instructors,
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $courses = Course::query()
            ->with(['category:id,name', 'instructor:id,name'])
            ->withCount('enrollments')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->value().'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('title', 'like', $term)->orWhere('slug', 'like', $term);
                });
            })
            ->when($request->string('status')->value() === 'published', fn ($query) => $query->where('is_published', true))
            ->when($request->string('status')->value() === 'draft', fn ($query) => $query->where('is_published', false))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($courses);
    }

    public function store(Request $request): JsonResponse
    {
        if ($request->filled('slug')) {
            $request->merge(['slug' => Str::slug($request->string('slug')->toString())]);
        }

        $payload = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('courses', 'slug')],
            'price' => ['required', 'numeric', 'min:0'],
            'is_free' => ['sometimes'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ]);

        $slug = filled($payload['slug'] ?? null)
            ? $payload['slug']
            : Str::slug($payload['title']).'-'.Str::lower(Str::random(6));

        while (Course::query()->where('slug', $slug)->exists()) {
            $slug = Str::slug($payload['title']).'-'.Str::lower(Str::random(6));
        }

        $thumbnailUrl = null;
        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('course-thumbnails', 'public');
            $thumbnailUrl = Storage::disk('public')->url($path);
        }

        $course = Course::query()->create([
            'category_id' => $payload['category_id'] ?? null,
            'title' => $payload['title'],
            'slug' => $slug,
            'price' => $request->boolean('is_free') ? 0 : $payload['price'],
            'is_free' => $request->boolean('is_free'),
            'is_published' => false,
            'duration_minutes' => 0,
            'thumbnail_url' => $thumbnailUrl,
        ]);

        PlatformCache::bust();

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course->load(['category:id,name', 'instructor:id,name']),
        ], 201);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json([
            'course' => $course->load([
                'category:id,name',
                'instructor:id,name',
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'lessons' => fn ($query) => $query->orderBy('sort_order'),
            ]),
        ]);
    }

    public function updateBasics(Request $request, Course $course): JsonResponse
    {
        if ($request->filled('slug')) {
            $request->merge(['slug' => Str::slug($request->string('slug')->toString())]);
        }

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($course->id)],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'is_free' => ['sometimes'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('course-thumbnails', 'public');
            $payload['thumbnail_url'] = Storage::disk('public')->url($path);
        }

        unset($payload['thumbnail']);

        if (array_key_exists('is_free', $payload)) {
            $payload['is_free'] = $request->boolean('is_free');
        }

        $course->update($payload);

        return response()->json([
            'message' => 'Course basics updated successfully.',
            'course' => $course->fresh(),
        ]);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $payload = $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'instructor_id' => ['nullable', 'exists:users,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'thumbnail_url' => ['nullable', 'url', 'max:2048'],
            'intro_video_url' => ['nullable', 'url', 'max:2048'],
            'resource_pdf_url' => ['nullable', 'url', 'max:2048'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'is_published' => ['sometimes', 'boolean'],
            'is_free' => ['sometimes', 'boolean'],
            'duration_minutes' => ['sometimes', 'integer', 'min:0'],
            'mcq_count' => ['sometimes', 'integer', 'min:0'],
            'mcq_pass_mark' => ['sometimes', 'integer', 'min:0'],
            'slug' => ['sometimes', 'string', Rule::unique('courses', 'slug')->ignore($course->id)],
        ]);

        if (isset($payload['title']) && ! isset($payload['slug'])) {
            $payload['slug'] = Str::slug($payload['title']).'-'.Str::lower(Str::random(6));
        }

        $course->update($payload);

        return response()->json([
            'message' => 'Course updated successfully.',
            'course' => $course->fresh()->load(['category:id,name', 'instructor:id,name']),
        ]);
    }

    public function togglePublish(Course $course): JsonResponse
    {
        $course->update(['is_published' => ! $course->is_published]);
        PlatformCache::bustCourse($course->slug);

        return response()->json([
            'message' => $course->is_published ? 'Course published successfully.' : 'Course moved to draft.',
            'course' => $course->fresh(['category:id,name', 'instructor:id,name']),
        ]);
    }

    public function destroy(Course $course): JsonResponse
    {
        $slug = $course->slug;
        $course->delete();
        PlatformCache::bustCourse($slug);

        return response()->json(['message' => 'Course deleted successfully.']);
    }
}

