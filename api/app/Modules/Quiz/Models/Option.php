<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Models;

use Database\Factories\Quiz\OptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('quiz_options')]
#[Fillable(['question_id', 'label', 'description', 'value_code', 'glyph', 'sort_order', 'archived_at'])]
class Option extends Model
{
    /** @use HasFactory<OptionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Question, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    public function archived(): bool
    {
        return $this->archived_at !== null;
    }

    protected static function newFactory(): OptionFactory
    {
        return OptionFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }
}
