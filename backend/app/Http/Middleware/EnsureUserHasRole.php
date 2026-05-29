<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $userRole = $user?->role?->slug;

        if (! $user || ! $userRole || ! in_array($userRole, $roles, true)) {
            return response()->json(['message' => 'You do not have permission for this action.'], 403);
        }

        return $next($request);
    }
}

