<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email')->nullable();
            $table->foreignId('cart_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('delivery_method_id')->nullable()->constrained('delivery_methods')->restrictOnDelete();
            $table->string('gateway', 50)->nullable();
            $table->string('reference', 50)->unique();
            $table->char('currency', 3)->default('XOF');
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('total');
            $table->json('destination')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('placed_at')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
