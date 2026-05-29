<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $studentRoleId = Role::query()->where('slug', 'student')->value('id');

        $students = User::query()
            ->when($studentRoleId, fn ($query) => $query->where('role_id', $studentRoleId))
            ->withCount(['enrollments', 'enrollments as active_enrollments_count' => fn ($query) => $query->where('status', 'active')])
            ->when($request->string('search')->isNotEmpty(), function ($query) use ($request): void {
                $term = '%'.$request->string('search')->value().'%';
                $query->where(function ($inner) use ($term): void {
                    $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
                });
            })
            ->when($request->string('status')->isNotEmpty() && $request->string('status')->value() !== 'all', function ($query) use ($request): void {
                $query->where('status', $request->string('status')->value());
            })
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($students);
    }
}
