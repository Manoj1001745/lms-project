<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Support\PlatformCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class SystemController extends Controller
{
    public function status(): JsonResponse
    {
        return response()->json([
            'cache_driver' => config('cache.default'),
            'app_env' => config('app.env'),
            'debug_mode' => (bool) config('app.debug'),
        ]);
    }

    public function clearCache(): JsonResponse
    {
        PlatformCache::bust();
        Cache::flush();
        Artisan::call('optimize:clear');

        return response()->json([
            'message' => 'Application cache cleared successfully. Public catalog and dashboard will refresh on next request.',
        ]);
    }
}
