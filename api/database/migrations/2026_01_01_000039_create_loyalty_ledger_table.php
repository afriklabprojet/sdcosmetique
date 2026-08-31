<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loyalty_ledger', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('account_id')->constrained('loyalty_accounts')->cascadeOnDelete();
            $table->integer('points_delta');
            $table->integer('balance_after');
            $table->string('reason', 32);
            $table->string('reference_type', 64)->nullable();
            $table->string('reference_id', 128)->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_ledger');
    }
};
