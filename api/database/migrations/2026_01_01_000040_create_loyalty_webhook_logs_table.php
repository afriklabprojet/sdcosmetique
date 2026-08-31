<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_webhook_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 191);
            $table->json('payload');
            $table->json('headers')->nullable();
            $table->string('status', 32)->default('received');
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_webhook_logs');
    }
};
