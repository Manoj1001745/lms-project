<?php

use App\Http\Controllers\API\V1\Admin\AuthController;
use App\Http\Controllers\API\V1\Admin\CategoryController;
use App\Http\Controllers\API\V1\Admin\CourseController;
use App\Http\Controllers\API\V1\Admin\CourseCurriculumController;
use App\Http\Controllers\API\V1\Admin\DashboardController;
use App\Http\Controllers\API\V1\Admin\PaymentController;
use App\Http\Controllers\API\V1\Admin\ProfessorController;
use App\Http\Controllers\API\V1\Admin\StudentController;
use App\Http\Controllers\API\V1\Admin\SiteSettingController;
use App\Http\Controllers\API\V1\Admin\SystemController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'admin.auth', 'role:super_admin,admin'])->group(function (): void {
    Route::get('me', [DashboardController::class, 'me']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('courses/meta', [CourseController::class, 'meta']);
    Route::patch('courses/{course:id}/publish', [CourseController::class, 'togglePublish']);
    Route::put('courses/{course:id}/basics', [CourseController::class, 'updateBasics']);
    Route::put('courses/{course:id}/details', [CourseCurriculumController::class, 'updateDetails']);
    Route::put('courses/{course:id}/curriculum', [CourseCurriculumController::class, 'syncCurriculum']);
    Route::get('courses', [CourseController::class, 'index'])->name('courses.index');
    Route::post('courses', [CourseController::class, 'store'])->name('courses.store');
    Route::get('courses/{course:id}', [CourseController::class, 'show'])->name('courses.show');
    Route::match(['put', 'patch'], 'courses/{course:id}', [CourseController::class, 'update'])->name('courses.update');
    Route::delete('courses/{course:id}', [CourseController::class, 'destroy'])->name('courses.destroy');
    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('payments/export', [PaymentController::class, 'export']);
    Route::get('professors', [ProfessorController::class, 'index']);
    Route::post('professors', [ProfessorController::class, 'store']);
    Route::put('professors/{user}', [ProfessorController::class, 'update']);
    Route::delete('professors/{user}', [ProfessorController::class, 'destroy']);
    Route::get('students', [StudentController::class, 'index']);
    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('categories', [CategoryController::class, 'store']);
    Route::put('categories/{category}', [CategoryController::class, 'update']);
    Route::delete('categories/{category}', [CategoryController::class, 'destroy']);
    Route::get('settings/site', [SiteSettingController::class, 'index']);
    Route::put('settings/site', [SiteSettingController::class, 'update']);
    Route::get('system/status', [SystemController::class, 'status']);
    Route::post('system/clear-cache', [SystemController::class, 'clearCache']);
    Route::post('logout', [AuthController::class, 'logout']);
});

