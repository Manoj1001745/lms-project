<?php

use App\Http\Controllers\API\V1\Public\CertificateVerificationController;
use App\Http\Controllers\API\V1\Public\CatalogController;
use App\Http\Controllers\API\V1\Public\ContactController;
use App\Http\Controllers\API\V1\Public\PaymentWebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('courses/catalog', [CatalogController::class, 'index']);
    Route::get('courses/catalog/{course}', [CatalogController::class, 'show']);
    Route::post('contact', [ContactController::class, 'store']);
    Route::get('certificates/verify/{certificateNo}', [CertificateVerificationController::class, 'show']);
    Route::post('payments/webhook/{gateway}', [PaymentWebhookController::class, 'handle']);
    Route::prefix('admin')->group(base_path('routes/admin.php'));
    Route::prefix('user')->group(base_path('routes/user.php'));
});

