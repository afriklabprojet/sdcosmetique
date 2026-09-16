<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Montant réellement remis par le client sur un règlement espèces (§7/§12) — distinct de `amount` (la part appliquée au total, utilisée telle quelle par le calcul de caisse). Renseigné seulement pour un tender cash avec monnaie à rendre ; sert uniquement à l'affichage du reçu. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_attempts', function (Blueprint $table): void {
            $table->unsignedBigInteger('received_amount')->nullable()->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('payment_attempts', function (Blueprint $table): void {
            $table->dropColumn('received_amount');
        });
    }
};
