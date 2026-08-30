<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_methods', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('zone');
            $table->string('carrier', 100);
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('cost')->default(0);
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_methods');
    }
};
