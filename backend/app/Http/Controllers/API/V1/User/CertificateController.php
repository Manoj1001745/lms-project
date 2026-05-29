<?php

namespace App\Http\Controllers\API\V1\User;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $certificates = Certificate::query()
            ->with([
                'course:id,title,slug',
            ])
            ->where('user_id', $request->user()->id)
            ->latest('issued_at')
            ->get();

        $baseUrl = rtrim(config('app.url'), '/');

        return response()->json([
            'certificates' => $certificates->map(function (Certificate $certificate) use ($baseUrl): array {
                return [
                    'id' => $certificate->id,
                    'certificate_no' => $certificate->certificate_no,
                    'issued_at' => $certificate->issued_at,
                    'course' => $certificate->course,
                    'verification_url' => $baseUrl.'/verify-certificate/'.$certificate->certificate_no,
                ];
            })->values(),
        ]);
    }

    public function download(Request $request, Certificate $certificate): Response|JsonResponse
    {
        if ($certificate->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Certificate access denied.'], 403);
        }

        $certificate->loadMissing(['course:id,title', 'user:id,name']);
        $verificationUrl = rtrim(config('app.url'), '/').'/verify-certificate/'.$certificate->certificate_no;
        $verificationQrSvg = QrCode::size(110)->margin(1)->generate($verificationUrl);

        $pdf = Pdf::loadView('certificates.completion', [
            'studentName' => $certificate->user->name,
            'courseTitle' => $certificate->course->title,
            'certificateNumber' => $certificate->certificate_no,
            'issuedAt' => $certificate->issued_at?->format('F d, Y'),
            'verificationUrl' => $verificationUrl,
            'verificationQrSvg' => $verificationQrSvg,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('learninghun-certificate-'.$certificate->certificate_no.'.pdf');
    }
}

