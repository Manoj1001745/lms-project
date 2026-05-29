<?php

namespace App\Providers;

use App\Models\Admin;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::bind('course', function (string $value): Course {
            $column = ctype_digit($value) ? 'id' : 'slug';

            return Course::query()->where($column, $value)->firstOrFail();
        });

        Gate::define('access-admin-panel', function ($user): bool {
            if (! $user instanceof Admin || $user->status !== 'active') {
                return false;
            }

            return in_array($user->role?->slug, ['super_admin', 'admin'], true);
        });

        Gate::define('access-student-panel', function ($user): bool {
            if (! $user instanceof User || $user->status !== 'active') {
                return false;
            }

            return in_array($user->role?->slug, ['student', 'professor'], true);
        });
    }
}
