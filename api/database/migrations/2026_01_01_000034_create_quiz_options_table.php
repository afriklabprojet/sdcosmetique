<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quiz_options', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('question_id')->constrained('quiz_questions')->cascadeOnDelete();
            $table->string('label', 128);
            $table->string('description', 255)->nullable();
            $table->string('value_code', 64);
            $table->string('glyph', 64)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();

            $table->unique(['question_id', 'value_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quiz_options');
    }
};
