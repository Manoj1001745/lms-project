<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->string('provider_payment_id')->nullable()->unique()->after('transaction_id');
            $table->string('idempotency_key')->nullable()->index()->after('provider_payment_id');
            $table->timestamp('confirmed_at')->nullable()->after('paid_at');
            $table->json('meta')->nullable()->after('confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['provider_payment_id', 'idempotency_key', 'confirmed_at', 'meta']);
        });
    }
};

