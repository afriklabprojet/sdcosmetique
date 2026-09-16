<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_refunds', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('admin_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('amount');
            // Comment l'argent est physiquement rendu — détermine si ça pèse
            // sur le tiroir-caisse (espèces) ou non à la fermeture de session.
            $table->string('method', 20);
            $table->string('reason', 500);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('pos_refund_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('pos_refund_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('amount');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_refund_items');
        Schema::dropIfExists('pos_refunds');
    }
};
