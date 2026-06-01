<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfessorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');
        $perPage = $request->integer('per_page', 15);

        if (! $professorRoleId) {
            return response()->json(User::query()->where('id', 0)->paginate($perPage));
        }

        $professors = User::query()
            ->where('role_id', $professorRoleId)
            ->withCount('taughtCourses')
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->value().'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
                });
            })
            ->when(
                $request->string('status')->isNotEmpty() && $request->string('status')->value() !== 'all',
                fn ($query) => $query->where('status', $request->string('status')->value())
            )
            ->latest()
            ->paginate($perPage);

        return response()->json($professors);
    }

    public function store(Request $request): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');

        if (! $professorRoleId) {
            return response()->json(['message' => 'Professor role not configured.'], 422);
        }

        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'avatar_url' => ['nullable', 'string', 'max:255'],
        ]);

        $professor = User::query()->create([
            'name' => $payload['name'],
            'email' => $payload['email'],
            'password' => $payload['password'],
            'role_id' => $professorRoleId,
            'status' => $payload['status'] ?? 'active',
            'avatar_url' => $payload['avatar_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Professor created successfully.',
            'professor' => $professor->loadCount('taughtCourses'),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');

        if (! $professorRoleId || $user->role_id !== $professorRoleId) {
            return response()->json(['message' => 'Professor not found.'], 404);
        }

        $payload = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'avatar_url' => ['nullable', 'string', 'max:255'],
        ]);

        if (array_key_exists('password', $payload) && ! filled($payload['password'])) {
            unset($payload['password']);
        }

        $user->fill($payload);
        $user->role_id = $professorRoleId;
        $user->save();

        return response()->json([
            'message' => 'Professor updated successfully.',
            'professor' => $user->fresh()->loadCount('taughtCourses'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');

        if (! $professorRoleId || $user->role_id !== $professorRoleId) {
            return response()->json(['message' => 'Professor not found.'], 404);
        }

        if ($user->taughtCourses()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a professor assigned to courses. Reassign courses first.',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'Professor deleted successfully.']);
    }
}
