<?php

namespace App\Http\Controllers\API\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Support\PlatformCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SiteSettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'site_name',
        'site_tagline',
        'contact_email',
        'contact_phone',
        'support_hours',
        'facebook_url',
        'instagram_url',
        'maintenance_mode',
    ];

    public function index(): JsonResponse
    {
        $settings = SiteSetting::query()
            ->whereIn('key', self::ALLOWED_KEYS)
            ->pluck('value', 'key');

        $payload = [];
        foreach (self::ALLOWED_KEYS as $key) {
            $payload[$key] = $settings[$key] ?? '';
        }

        return response()->json(['settings' => $payload]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:500'],
            'contact_email' => ['required', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'support_hours' => ['nullable', 'string', 'max:255'],
            'facebook_url' => ['nullable', 'string', 'max:2048'],
            'instagram_url' => ['nullable', 'string', 'max:2048'],
            'maintenance_mode' => ['sometimes', 'boolean'],
        ]);

        $payload['maintenance_mode'] = $request->boolean('maintenance_mode') ? '1' : '0';

        foreach ($payload as $key => $value) {
            SiteSetting::setValue($key, $value === null ? '' : (string) $value);
        }

        Cache::forget('site.settings');
        PlatformCache::bust();

        return response()->json([
            'message' => 'Site settings saved successfully.',
            'settings' => SiteSetting::query()->whereIn('key', self::ALLOWED_KEYS)->pluck('value', 'key'),
        ]);
    }
}
