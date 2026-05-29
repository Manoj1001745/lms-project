<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

class PlatformCache
{
    public static function bust(): void
    {
        Cache::forget('admin.dashboard.stats');
        Cache::forget('catalog.public');
    }

    public static function bustCourse(string $slug): void
    {
        self::bust();
        Cache::forget('catalog.course.'.$slug);
    }
}
