<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

/**
 * The `banners` table was never read by the storefront — the admin's
 * "Marketing → Bannières" UI manages promotional banners through
 * `settings.marketing.banners` (JSON) instead. Dropped rather than kept
 * dead, to avoid two competing banner mechanisms.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('banners');
    }

    public function down(): void
    {
        Schema::create('banners', function (\Illuminate\Database\Schema\Blueprint $table): void {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('image_url');
            $table->string('link_url')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamp('visible_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }
};
