<?php

namespace App\Http\Controllers\API\V1\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['required', 'string', 'max:2000'],
        ]);

        $recipient = config('services.contact.receiver_email', 'khadkamanok1001@gmail.com');

        Mail::raw(
            "New contact inquiry from LearningHun website.\n\n".
            "Name: {$payload['name']}\n".
            "Email: {$payload['email']}\n".
            "Phone: ".($payload['phone'] ?? 'N/A')."\n\n".
            "Message:\n{$payload['message']}\n",
            function ($message) use ($payload, $recipient): void {
                $message
                    ->to($recipient)
                    ->subject('LearningHun Contact Form Submission')
                    ->replyTo($payload['email'], $payload['name']);
            }
        );

        return response()->json([
            'message' => 'Thank you for contacting us. We will respond soon.',
        ]);
    }
}

