<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Models;

use App\Modules\Catalog\Models\Product;
use App\Modules\Quiz\Enums\QuizTier;
use Database\Factories\Quiz\RuleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('quiz_rules')]
#[Fillable(['conditions', 'product_id', 'tier', 'priority', 'archived_at'])]
class Rule extends Model
{
    /** @use HasFactory<RuleFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function matches(Submission $submission): bool
    {
        $answers = $submission->answerMap();
        $conditions = is_array($this->conditions) ? $this->conditions : [];

        foreach ($conditions as $slug => $code) {
            if (($answers[$slug] ?? null) !== $code) {
                return false;
            }
        }

        return $conditions !== [];
    }

    protected static function newFactory(): RuleFactory
    {
        return RuleFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'conditions' => 'array',
            'tier' => QuizTier::class,
            'archived_at' => 'datetime',
        ];
    }
}
