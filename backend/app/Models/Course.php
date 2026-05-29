<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'instructor_id',
        'title',
        'slug',
        'description',
        'thumbnail_url',
        'intro_video_url',
        'resource_pdf_url',
        'price',
        'is_published',
        'is_free',
        'duration_minutes',
        'mcq_count',
        'mcq_pass_mark',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_published' => 'boolean',
        'is_free' => 'boolean',
        'mcq_count' => 'integer',
        'mcq_pass_mark' => 'integer',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        if ($field === 'id' || ($field === null && is_numeric($value))) {
            return $this->whereKey($value)->firstOrFail();
        }

        return $this->where('slug', $value)->firstOrFail();
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: function (?string $value): ?string {
                if (! $value) {
                    return null;
                }

                $base = rtrim((string) config('app.url'), '/');

                if (preg_match('#^https?://localhost(?::\d+)?(/|$)#i', $value) && ! preg_match('#:8000#', $value)) {
                    $path = parse_url($value, PHP_URL_PATH) ?: '';
                    $query = parse_url($value, PHP_URL_QUERY);

                    return $base.$path.($query ? '?'.$query : '');
                }

                if (str_starts_with($value, '/storage/')) {
                    return $base.$value;
                }

                return $value;
            },
        );
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }
}

