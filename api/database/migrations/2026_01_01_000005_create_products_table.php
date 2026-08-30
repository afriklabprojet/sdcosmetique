<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('description')->nullable();
            $table->json('ingredients')->nullable();
            $table->text('usage')->nullable();
            $table->string('sku', 100)->nullable()->unique();
            $table->string('label')->nullable();
            $table->unsignedBigInteger('regular_price')->nullable();
            $table->unsignedBigInteger('sale_price')->nullable();
            $table->unsignedInteger('stock')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
