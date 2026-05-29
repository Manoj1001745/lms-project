<?php

use App\Http\Controllers\API\V1\User\AuthController;
use App\Http\Controllers\API\V1\User\CertificateController;
use App\Http\Controllers\API\V1\User\CourseController;
use App\Http\Controllers\API\V1\User\DashboardController;
use App\Http\Controllers\API\V1\User\PaymentHistoryController;
use App\Http\Controllers\API\V1\User\PaymentController;
use App\Http\Controllers\API\V1\User\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'user.auth', 'role:student,professor'])->group(function (): void {
    Route::get('me', [DashboardController::class, 'me']);
    Route::patch('profile', [ProfileController::class, 'update']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('courses', [CourseController::class, 'index']);
    Route::get('courses/{course}', [CourseController::class, 'show']);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll']);
    Route::post('courses/{course}/payments/initiate', [PaymentController::class, 'initiate']);
    Route::post('courses/{course}/payments/confirm', [PaymentController::class, 'confirm']);
    Route::get('courses/{course}/lessons/{lesson}', [CourseController::class, 'lesson']);
    Route::post('courses/{course}/lessons/{lesson}/progress', [CourseController::class, 'updateProgress']);
    Route::get('my-courses', [CourseController::class, 'myCourses']);
    Route::get('payments', [PaymentHistoryController::class, 'index']);
    Route::get('payments/export', [PaymentHistoryController::class, 'export']);
    Route::get('certificates', [CertificateController::class, 'index']);
    Route::get('certificates/{certificate}/download', [CertificateController::class, 'download']);
    Route::post('logout', [AuthController::class, 'logout']);
});

