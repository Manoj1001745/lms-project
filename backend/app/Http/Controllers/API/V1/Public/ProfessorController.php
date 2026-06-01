<?php

namespace App\Http\Controllers\API\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ProfessorController extends Controller
{
    public function index(): JsonResponse
    {
        $professorRoleId = Role::query()->where('slug', 'professor')->value('id');

        if (! $professorRoleId) {
            return response()->json(['professors' => []]);
        }

        $professors = User::query()
            ->where('role_id', $professorRoleId)
            ->where('status', 'active')
            ->withCount('taughtCourses')
            ->orderBy('name')
            ->get(['id', 'name', 'avatar_url']);

        return response()->json(['professors' => $professors]);
    }
}
