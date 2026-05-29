<?php

namespace App\Http\Controllers\API\V1\User;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Stripe\Exception\ApiErrorException;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    public function initiate(Request $request, Course $course): JsonResponse
    {
        $payload = $request->validate([
            'gateway' => ['required', 'in:stripe,khalti,esewa'],
            'idempotency_key' => ['required', 'string', 'max:120'],
        ]);

        if (! $course->is_published) {
            return response()->json(['message' => 'Course is not available for purchase.'], 422);
        }

        if ($course->is_free) {
            return response()->json(['message' => 'This course is free. Use enroll endpoint directly.'], 422);
        }

        $existingEnrollment = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->exists();

        if ($existingEnrollment) {
            return response()->json(['message' => 'You are already enrolled in this course.'], 422);
        }

        $existingPayment = Payment::query()
            ->where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->where('gateway', $payload['gateway'])
            ->where('idempotency_key', $payload['idempotency_key'])
            ->first();

        if ($existingPayment) {
            return response()->json([
                'message' => 'Existing payment intent reused.',
                'payment' => $existingPayment,
            ]);
        }

        $payment = Payment::query()->create([
            'user_id' => $request->user()->id,
            'course_id' => $course->id,
            'gateway' => $payload['gateway'],
            'transaction_id' => 'LH-PAY-'.Str::upper(Str::random(14)),
            'idempotency_key' => $payload['idempotency_key'],
            'amount' => $course->price,
            'currency' => 'NPR',
            'status' => 'pending',
            'meta' => [
                'course_slug' => $course->slug,
                'user_email' => $request->user()->email,
            ],
        ]);

        $checkoutUrl = null;
        $demoMode = (bool) config('services.payments.demo_mode', true);
        $stripeSecret = config('services.stripe.secret');

        if ($payload['gateway'] === 'stripe' && $stripeSecret && ! $demoMode) {
            try {
                $stripe = new StripeClient($stripeSecret);
                $frontendUrl = rtrim(config('services.stripe.frontend_url') ?: env('FRONTEND_URL', 'http://localhost:3000'), '/');
                $stripeCurrency = strtolower((string) config('services.stripe.currency', 'usd'));
                $unitAmount = (int) round(((float) $course->price) * 100);

                if ($stripeCurrency === 'npr') {
                    // Stripe expects whole rupees for NPR (not paisa).
                    $unitAmount = (int) round((float) $course->price);
                }

                $session = $stripe->checkout->sessions->create([
                    'mode' => 'payment',
                    'payment_method_types' => ['card'],
                    'line_items' => [[
                        'quantity' => 1,
                        'price_data' => [
                            'currency' => $stripeCurrency,
                            'unit_amount' => max(1, $unitAmount),
                            'product_data' => [
                                'name' => $course->title,
                                'description' => 'LearningHun course purchase',
                            ],
                        ],
                    ]],
                    'success_url' => $frontendUrl.'/checkout/status?status=success&course='.$course->slug.'&session_id={CHECKOUT_SESSION_ID}',
                    'cancel_url' => $frontendUrl.'/checkout/status?status=cancelled&course='.$course->slug,
                    'metadata' => [
                        'transaction_id' => $payment->transaction_id,
                        'course_slug' => $course->slug,
                        'user_id' => (string) $request->user()->id,
                    ],
                ]);

                $payment->update([
                    'provider_payment_id' => $session->id,
                    'meta' => array_merge($payment->meta ?? [], [
                        'stripe_checkout_session_id' => $session->id,
                    ]),
                ]);

                $checkoutUrl = $session->url;
            } catch (ApiErrorException $exception) {
                if (! $demoMode) {
                    return response()->json([
                        'message' => 'Unable to create Stripe checkout session.',
                        'details' => $exception->getMessage(),
                    ], 500);
                }

                $payment->update([
                    'meta' => array_merge($payment->meta ?? [], [
                        'stripe_error' => $exception->getMessage(),
                        'fallback' => 'demo_confirm',
                    ]),
                ]);
            }
        } elseif ($payload['gateway'] === 'stripe') {
            $payment->update([
                'meta' => array_merge($payment->meta ?? [], [
                    'mode' => 'demo_confirm',
                    'note' => 'Stripe not configured or demo mode enabled — confirm via API.',
                ]),
            ]);
        }

        return response()->json([
            'message' => $checkoutUrl
                ? 'Payment initiated successfully.'
                : 'Payment initiated. Complete checkout in demo mode or configure Stripe for live payments.',
            'payment' => $payment->fresh(),
            'checkout_url' => $checkoutUrl,
            'demo_mode' => $checkoutUrl === null,
        ], 201);
    }

    public function confirm(Request $request, Course $course): JsonResponse
    {
        $payload = $request->validate([
            'transaction_id' => ['required', 'string'],
            'provider_payment_id' => ['nullable', 'string', 'max:120'],
            'status' => ['required', 'in:paid,failed,cancelled'],
        ]);

        $payment = Payment::query()
            ->where('transaction_id', $payload['transaction_id'])
            ->where('course_id', $course->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment intent not found.'], 404);
        }

        if ($payment->status === 'paid') {
            return response()->json([
                'message' => 'Payment already confirmed.',
                'payment' => $payment,
            ]);
        }

        $payment->update([
            'provider_payment_id' => $payload['provider_payment_id'] ?? $payment->provider_payment_id,
            'status' => $payload['status'],
            'paid_at' => $payload['status'] === 'paid' ? now() : null,
            'confirmed_at' => now(),
        ]);

        if ($payment->status === 'paid') {
            $this->enrollUser($payment);
        }

        return response()->json([
            'message' => 'Payment confirmation processed.',
            'payment' => $payment->fresh(),
        ]);
    }

    private function enrollUser(Payment $payment): void
    {
        Enrollment::query()->firstOrCreate(
            [
                'user_id' => $payment->user_id,
                'course_id' => $payment->course_id,
            ],
            [
                'enrolled_at' => now(),
                'status' => 'active',
                'progress_percentage' => 0,
            ]
        );
    }
}

