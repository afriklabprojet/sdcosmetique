<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->foreign('parent_id')->references('id')->on('products')->nullOnDelete();
        });

        Schema::table('clients', function (Blueprint $table): void {
            $table->foreign('shipping_id')->references('id')->on('addresses')->nullOnDelete();
            $table->foreign('billing_id')->references('id')->on('addresses')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('products', function (Blueprint $table): void {
            $table->dropForeign(['parent_id']);
        });

        Schema::table('clients', function (Blueprint $table): void {
            $table->dropForeign(['shipping_id']);
            $table->dropForeign(['billing_id']);
        });
    }
};
