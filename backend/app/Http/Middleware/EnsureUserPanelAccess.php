<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserPanelAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return response()->json(['message' => 'User access is required.'], 403);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'User account is not active.'], 403);
        }

        return $next($request);
    }
}

