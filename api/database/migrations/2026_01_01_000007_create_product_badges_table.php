<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_badges', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label', 100);
            $table->string('type', 50)->default('sale');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_badges');
    }
};
