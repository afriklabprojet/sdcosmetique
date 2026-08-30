<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_attempts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 50);
            $table->string('reference', 100);
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('XOF');
            $table->string('redirect_url', 2048)->nullable();
            $table->json('request_payload')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('initiated_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();
            $table->unique(['gateway', 'reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};
