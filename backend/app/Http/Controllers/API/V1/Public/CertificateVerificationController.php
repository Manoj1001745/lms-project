<?php

namespace App\Http\Controllers\API\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;

class CertificateVerificationController extends Controller
{
    public function show(string $certificateNo): JsonResponse
    {
        $certificate = Certificate::query()
            ->with(['course:id,title,slug', 'user:id,name'])
            ->where('certificate_no', $certificateNo)
            ->first();

        if (! $certificate) {
            return response()->json([
                'valid' => false,
                'message' => 'Certificate not found.',
            ], 404);
        }

        return response()->json([
            'valid' => true,
            'certificate' => [
                'certificate_no' => $certificate->certificate_no,
                'issued_at' => $certificate->issued_at,
                'student_name' => $certificate->user?->name,
                'course_title' => $certificate->course?->title,
                'course_slug' => $certificate->course?->slug,
            ],
        ]);
    }
}

