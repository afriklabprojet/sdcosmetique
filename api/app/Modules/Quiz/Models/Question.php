<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Models;

use App\Modules\Quiz\Enums\QuestionType;
use Database\Factories\Quiz\QuestionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('quiz_questions')]
#[Fillable(['slug', 'title', 'subtitle', 'question_type', 'sort_order', 'archived_at'])]
class Question extends Model
{
    /** @use HasFactory<QuestionFactory> */
    use HasFactory;

    /**
     * @return HasMany<Option, $this>
     */
    public function options(): HasMany
    {
        return $this->hasMany(Option::class, 'question_id')->orderBy('sort_order');
    }

    public function archived(): bool
    {
        return $this->archived_at !== null;
    }

    /**
     * @param  list<array<string, mixed>>  $rows
     */
    public function syncOptions(array $rows): void
    {
        $keep = [];

        foreach ($rows as $index => $row) {
            $option = isset($row['id'])
                ? $this->options()->whereKey($row['id'])->first()
                : $this->options()->where('value_code', $row['value_code'])->first();

            $payload = [
                'label' => $row['label'],
                'description' => $row['description'] ?? null,
                'value_code' => $row['value_code'],
                'glyph' => $row['glyph'] ?? null,
                'sort_order' => $row['sort_order'] ?? $index,
                'archived_at' => ($row['archived'] ?? false) ? now() : null,
            ];

            if ($option === null) {
                $option = $this->options()->create($payload);
            } else {
                $option->fill($payload)->save();
            }

            $keep[] = $option->id;
        }

        $this->options()->whereNotIn('id', $keep)->update(['archived_at' => now()]);
    }

    protected static function newFactory(): QuestionFactory
    {
        return QuestionFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'question_type' => QuestionType::class,
            'archived_at' => 'datetime',
        ];
    }
}
