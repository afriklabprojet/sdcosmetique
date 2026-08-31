<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_rules', function (Blueprint $table): void {
            $table->id();
            $table->json('conditions');
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('tier', 32)->default('essential');
            $table->integer('priority')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_rules');
    }
};
