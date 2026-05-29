<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'site_name' => 'LearningHun',
            'site_tagline' => 'Premium Competitive Learning Platform',
            'contact_email' => 'khadkamanok1001@gmail.com',
            'contact_phone' => '+977-9800000000',
            'support_hours' => 'Sun–Fri, 9:00 AM – 6:00 PM',
            'facebook_url' => '',
            'instagram_url' => '',
            'maintenance_mode' => '0',
        ];

        foreach ($defaults as $key => $value) {
            SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}
