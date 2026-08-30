<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_notifications', function (Blueprint $table): void {
            $table->id();
            $table->string('gateway', 50);
            $table->string('reference', 100);
            $table->foreignId('payment_attempt_id')->nullable()->constrained('payment_attempts')->nullOnDelete();
            $table->json('payload');
            $table->string('failure_reason')->nullable();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_notifications');
    }
};
