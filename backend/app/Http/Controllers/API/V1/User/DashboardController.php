<?php

namespace App\Http\Controllers\API\V1\User;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->loadMissing('role'),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $enrollmentQuery = Enrollment::query()->where('user_id', $user->id);

        return response()->json([
            'student' => $user->loadMissing('role'),
            'learning' => [
                'enrolled_courses' => (clone $enrollmentQuery)->count(),
                'completed_courses' => (clone $enrollmentQuery)->where('progress_percentage', 100)->count(),
                'completion_rate' => (int) round((clone $enrollmentQuery)->avg('progress_percentage') ?? 0),
            ],
        ]);
    }
}

