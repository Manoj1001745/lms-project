<?php

namespace App\Http\Controllers\API\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request, string $gateway): JsonResponse
    {
        if (! in_array($gateway, ['stripe', 'khalti', 'esewa'], true)) {
            return response()->json(['message' => 'Unsupported payment gateway.'], 422);
        }

        if ($gateway === 'stripe') {
            return $this->handleStripeWebhook($request);
        }

        if (! $this->isSignatureValid($request)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        $payload = $request->validate([
            'transaction_id' => ['required', 'string'],
            'provider_payment_id' => ['nullable', 'string', 'max:120'],
            'status' => ['required', 'in:paid,failed,cancelled'],
        ]);

        return $this->processPayment($gateway, $payload['transaction_id'], $payload['status'], $payload['provider_payment_id'] ?? null);
    }

    private function handleStripeWebhook(Request $request): JsonResponse
    {
        $stripeWebhookSecret = config('services.stripe.webhook_secret');
        if (! $stripeWebhookSecret) {
            return response()->json(['message' => 'Stripe webhook secret is not configured.'], 500);
        }

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                (string) $request->header('Stripe-Signature'),
                $stripeWebhookSecret
            );
        } catch (UnexpectedValueException|SignatureVerificationException $exception) {
            return response()->json(['message' => 'Invalid Stripe webhook payload/signature.'], 401);
        }

        if ($event->type !== 'checkout.session.completed') {
            return response()->json(['message' => 'Stripe event ignored.']);
        }

        $session = $event->data->object;
        $transactionId = $session->metadata->transaction_id ?? null;
        $providerPaymentId = $session->id ?? null;

        if (! $transactionId) {
            return response()->json(['message' => 'Stripe transaction metadata missing.'], 422);
        }

        return $this->processPayment('stripe', $transactionId, 'paid', $providerPaymentId);
    }

    private function processPayment(string $gateway, string $transactionId, string $status, ?string $providerPaymentId): JsonResponse
    {
        $payment = Payment::query()
            ->where('transaction_id', $transactionId)
            ->where('gateway', $gateway)
            ->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment intent not found.'], 404);
        }

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment already processed.']);
        }

        $payment->update([
            'provider_payment_id' => $providerPaymentId ?? $payment->provider_payment_id,
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
            'confirmed_at' => now(),
        ]);

        if ($payment->status === 'paid') {
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

        return response()->json(['message' => 'Webhook processed successfully.']);
    }

    private function isSignatureValid(Request $request): bool
    {
        $secret = config('services.payments.webhook_secret');
        if (! $secret) {
            return true;
        }

        $signature = $request->header('X-LearningHun-Signature');
        if (! $signature) {
            return false;
        }

        $computedSignature = hash_hmac('sha256', $request->getContent(), $secret);
        return hash_equals($computedSignature, $signature);
    }
}

