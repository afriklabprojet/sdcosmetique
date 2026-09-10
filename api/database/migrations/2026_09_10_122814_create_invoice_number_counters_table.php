<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Une ligne par année civile — la génération du numéro de facture verrouille
 * (`lockForUpdate`) la ligne de l'année en cours dans une transaction, ce qui
 * rend l'incrémentation sûre même si plusieurs commandes sont réglées au même
 * instant (aucun doublon, aucun trou silencieux).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_number_counters', function (Blueprint $table): void {
            $table->unsignedSmallInteger('year')->primary();
            $table->unsignedInteger('last_number')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoice_number_counters');
    }
};
