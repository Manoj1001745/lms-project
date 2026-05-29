<?php

namespace App\Http\Controllers\API\V1\User;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $studentRole = Role::query()->where('slug', 'student')->first();

        $payload['role_id'] = $studentRole?->id;
        $payload['status'] = 'active';

        $user = User::query()->create($payload);

        $token = $user->createToken('user-panel-token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'token' => $token,
            'user' => $user,
        ], 201)->cookie(
            'learninghun_user_token',
            $token,
            60 * 24 * 7,
            '/',
            null,
            false,
            true
        );
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid user credentials.'], 422);
        }

        $token = $user->createToken('user-panel-token')->plainTextToken;

        return response()->json([
            'message' => 'User login successful.',
            'token' => $token,
            'user' => $user,
        ])->cookie(
            'learninghun_user_token',
            $token,
            60 * 24 * 7,
            '/',
            null,
            false,
            true
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'User logged out successfully.'])
            ->withoutCookie('learninghun_user_token');
    }
}

