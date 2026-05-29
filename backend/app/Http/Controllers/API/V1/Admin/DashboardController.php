<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'admin' => $request->user()->loadMissing('role'),
        ]);
    }

    public function index(): JsonResponse
    {
        $payload = Cache::remember('admin.dashboard.stats', now()->addMinutes(5), function (): array {
            $studentRoleId = Role::query()->where('slug', 'student')->value('id');

            $studentQuery = User::query()->when($studentRoleId, fn ($q) => $q->where('role_id', $studentRoleId));

            return [
                'revenue' => [
                    'total' => (float) Payment::query()->where('status', 'paid')->sum('amount'),
                    'currency' => 'NPR',
                    'this_month' => (float) Payment::query()
                        ->where('status', 'paid')
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->sum('amount'),
                ],
                'students' => [
                    'total' => (clone $studentQuery)->count(),
                    'active' => (clone $studentQuery)->where('status', 'active')->count(),
                ],
                'courses' => [
                    'total' => Course::query()->count(),
                    'published' => Course::query()->where('is_published', true)->count(),
                    'draft' => Course::query()->where('is_published', false)->count(),
                ],
                'enrollments' => [
                    'total' => Enrollment::query()->count(),
                    'active' => Enrollment::query()->where('status', 'active')->count(),
                ],
            ];
        });

        $recentPayments = Payment::query()
            ->with(['user:id,name,email', 'course:id,title'])
            ->latest()
            ->limit(5)
            ->get(['id', 'transaction_id', 'amount', 'currency', 'status', 'user_id', 'course_id', 'created_at']);

        $recentEnrollments = Enrollment::query()
            ->with(['user:id,name,email', 'course:id,title'])
            ->latest()
            ->limit(5)
            ->get(['id', 'status', 'user_id', 'course_id', 'enrolled_at', 'created_at']);

        return response()->json([
            ...$payload,
            'recent_payments' => $recentPayments,
            'recent_enrollments' => $recentEnrollments,
        ]);
    }
}

