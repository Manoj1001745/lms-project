<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPanelAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof Admin) {
            return response()->json(['message' => 'Admin access is required.'], 403);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Admin account is not active.'], 403);
        }

        return $next($request);
    }
}

