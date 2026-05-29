<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LmsCoreSeeder extends Seeder
{
    public function run(): void
    {
        $professorRole = Role::query()->where('slug', 'professor')->first();
        $studentRole = Role::query()->where('slug', 'student')->first();

        $professor = User::query()->updateOrCreate(
            ['email' => 'professor@learninghun.com'],
            [
                'name' => 'LearningHun Professor',
                'password' => 'Password@123',
                'role_id' => $professorRole?->id,
                'status' => 'active',
            ]
        );

        $studentIds = User::query()
            ->where('role_id', $studentRole?->id)
            ->limit(10)
            ->pluck('id');

        $categories = collect([
            'Web Development',
            'Data Science',
            'Business',
            'Design',
        ])->map(function (string $name): Category {
            return Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        });

        foreach ($categories as $category) {
            for ($i = 1; $i <= 3; $i++) {
                $title = $category->name.' Masterclass '.$i;
                $course = Course::query()->updateOrCreate(
                    ['slug' => Str::slug($title)],
                    [
                        'category_id' => $category->id,
                        'instructor_id' => $professor->id,
                        'title' => $title,
                        'description' => 'Production-ready curriculum for '.$title,
                        'price' => 1999 + ($i * 500),
                        'is_published' => true,
                        'is_free' => false,
                        'duration_minutes' => 240 + ($i * 60),
                    ]
                );

                foreach ($studentIds as $studentId) {
                    if (($studentId + $i + $category->id) % 3 !== 0) {
                        continue;
                    }

                    Enrollment::query()->updateOrCreate(
                        ['user_id' => $studentId, 'course_id' => $course->id],
                        [
                            'enrolled_at' => now()->subDays(rand(1, 30)),
                            'status' => 'active',
                            'progress_percentage' => rand(5, 95),
                        ]
                    );

                    Payment::query()->updateOrCreate(
                        [
                            'transaction_id' => 'LH-'.$studentId.'-'.$course->id,
                        ],
                        [
                            'user_id' => $studentId,
                            'course_id' => $course->id,
                            'gateway' => ['stripe', 'khalti', 'esewa'][($studentId + $course->id) % 3],
                            'amount' => $course->price,
                            'currency' => 'NPR',
                            'status' => 'paid',
                            'paid_at' => now()->subDays(rand(1, 30)),
                        ]
                    );
                }
            }
        }
    }
}

