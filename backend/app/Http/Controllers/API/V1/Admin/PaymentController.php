<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::query()
            ->with(['user:id,name,email', 'course:id,title,slug'])
            ->when($request->string('status')->isNotEmpty(), function ($query) use ($request): void {
                $query->where('status', $request->string('status')->value());
            })
            ->when($request->string('from')->isNotEmpty(), function ($query) use ($request): void {
                $query->whereDate('created_at', '>=', $request->string('from')->value());
            })
            ->when($request->string('to')->isNotEmpty(), function ($query) use ($request): void {
                $query->whereDate('created_at', '<=', $request->string('to')->value());
            })
            ->latest()
            ->paginate(30);

        return response()->json($payments);
    }

    public function export(Request $request): StreamedResponse
    {
        $payments = Payment::query()
            ->with(['user:id,name,email', 'course:id,title'])
            ->when($request->string('status')->isNotEmpty(), function ($query) use ($request): void {
                $query->where('status', $request->string('status')->value());
            })
            ->when($request->string('from')->isNotEmpty(), function ($query) use ($request): void {
                $query->whereDate('created_at', '>=', $request->string('from')->value());
            })
            ->when($request->string('to')->isNotEmpty(), function ($query) use ($request): void {
                $query->whereDate('created_at', '<=', $request->string('to')->value());
            })
            ->latest()
            ->get();

        return response()->streamDownload(function () use ($payments): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'User Name',
                'User Email',
                'Course',
                'Transaction ID',
                'Gateway',
                'Amount',
                'Currency',
                'Status',
                'Created At',
            ]);

            foreach ($payments as $payment) {
                fputcsv($handle, [
                    $payment->user?->name ?? 'User',
                    $payment->user?->email ?? '',
                    $payment->course?->title ?? 'Course',
                    $payment->transaction_id,
                    $payment->gateway,
                    (string) $payment->amount,
                    $payment->currency,
                    $payment->status,
                    (string) $payment->created_at,
                ]);
            }

            fclose($handle);
        }, 'learninghun-admin-payments.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}

