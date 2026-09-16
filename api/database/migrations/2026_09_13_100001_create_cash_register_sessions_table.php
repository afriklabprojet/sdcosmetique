<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_register_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cash_register_id')->constrained()->restrictOnDelete();
            $table->foreignId('admin_id')->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('opening_balance');
            $table->unsignedBigInteger('expected_cash')->nullable();
            $table->unsignedBigInteger('actual_cash')->nullable();
            $table->bigInteger('difference')->nullable();
            $table->string('status', 20)->default('open');
            $table->text('notes')->nullable();
            $table->timestamp('opened_at');
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Une seule session ouverte à la fois par caisse — contrainte
            // applicative vérifiée dans CashRegisterSession::openFor() (sous
            // verrou) ; cet index accélère la recherche de la session active.
            $table->index(['cash_register_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_register_sessions');
    }
};
