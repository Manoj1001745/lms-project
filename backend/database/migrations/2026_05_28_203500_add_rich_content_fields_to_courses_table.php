<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->string('thumbnail_url')->nullable()->after('description');
            $table->string('intro_video_url')->nullable()->after('thumbnail_url');
            $table->string('resource_pdf_url')->nullable()->after('intro_video_url');
            $table->unsignedInteger('mcq_count')->default(0)->after('duration_minutes');
            $table->unsignedInteger('mcq_pass_mark')->default(0)->after('mcq_count');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->dropColumn([
                'thumbnail_url',
                'intro_video_url',
                'resource_pdf_url',
                'mcq_count',
                'mcq_pass_mark',
            ]);
        });
    }
};

