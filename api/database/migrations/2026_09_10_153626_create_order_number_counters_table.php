<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Une ligne par année civile — même mécanique que `invoice_number_counters` :
 * la génération verrouille (`lockForUpdate`) la ligne de l'année en cours
 * dans une transaction, sûr même si plusieurs commandes sont validées au
 * même instant (aucun doublon, aucun trou silencieux).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_number_counters', function (Blueprint $table): void {
            $table->unsignedSmallInteger('year')->primary();
            $table->unsignedInteger('last_number')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_number_counters');
    }
};
