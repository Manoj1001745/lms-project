<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'super_admin', 'description' => 'Full platform control'],
            ['name' => 'Admin', 'slug' => 'admin', 'description' => 'Platform operations and moderation'],
            ['name' => 'Professor', 'slug' => 'professor', 'description' => 'Course and class management'],
            ['name' => 'Student', 'slug' => 'student', 'description' => 'Learning and course participation'],
        ];

        foreach ($roles as $role) {
            Role::query()->updateOrCreate(['slug' => $role['slug']], $role);
        }
    }
}

