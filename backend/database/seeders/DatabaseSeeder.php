<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $superAdminRole = Role::query()->where('slug', 'super_admin')->first();
        $studentRole = Role::query()->where('slug', 'student')->first();

        Admin::query()->updateOrCreate([
            'email' => 'superadmin@learninghun.com',
        ], [
            'name' => 'LearningHun Super Admin',
            'password' => 'Password@123',
            'role_id' => $superAdminRole?->id,
            'is_super_admin' => true,
            'status' => 'active',
        ]);

        User::factory()->count(10)->create([
            'role_id' => $studentRole?->id,
            'status' => 'active',
        ]);

        User::query()->updateOrCreate([
            'email' => 'student@learninghun.com',
        ], [
            'name' => 'LearningHun Student',
            'password' => 'Password@123',
            'role_id' => $studentRole?->id,
            'status' => 'active',
        ]);

        $this->call(LmsCoreSeeder::class);
        $this->call(SiteSettingSeeder::class);
    }
}
