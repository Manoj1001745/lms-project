<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\PlatformCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->withCount('courses')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->value().'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', $term)->orWhere('slug', 'like', $term);
                });
            })
            ->orderBy('name')
            ->paginate($request->integer('per_page', 20));

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')],
            'description' => ['nullable', 'string'],
        ]);

        if ($request->filled('slug')) {
            $payload['slug'] = Str::slug($request->string('slug')->toString());
        } else {
            $payload['slug'] = $this->uniqueSlug(Str::slug($payload['name']));
        }

        $category = Category::query()->create($payload);
        PlatformCache::bust();

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category,
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string'],
        ]);

        if (isset($payload['slug'])) {
            $payload['slug'] = Str::slug($payload['slug']);
        }

        $category->update($payload);
        PlatformCache::bust();

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category->fresh()->loadCount('courses'),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->courses()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a category that has courses assigned. Reassign courses first.',
            ], 422);
        }

        $category->delete();
        PlatformCache::bust();

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    private function uniqueSlug(string $base): string
    {
        $slug = $base ?: 'category';
        $original = $slug;
        $counter = 1;

        while (Category::query()->where('slug', $slug)->exists()) {
            $slug = $original.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
