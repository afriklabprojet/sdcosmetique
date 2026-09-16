<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            // 'online' (par défaut, tunnel web existant) ou 'pos' (vente en
            // caisse) — permet de distinguer les deux origines sans dupliquer
            // le modèle Order ni la logique de commande.
            $table->string('channel', 20)->default('online')->after('gateway');
            $table->foreignId('cash_register_session_id')->nullable()->after('channel')
                ->constrained()->nullOnDelete();
            $table->foreignId('served_by')->nullable()->after('cash_register_session_id')
                ->constrained('admins')->nullOnDelete();
            // Empêche la création de deux ventes pour un même clic/tentative
            // réseau rejouée depuis le POS (§28 idempotence).
            $table->string('idempotency_key', 64)->nullable()->unique()->after('served_by');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('served_by');
            $table->dropConstrainedForeignId('cash_register_session_id');
            $table->dropColumn(['channel', 'idempotency_key']);
        });
    }
};
