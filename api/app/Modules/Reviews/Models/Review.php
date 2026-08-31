<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Models;

use App\Modules\Catalog\Models\Product;
use Database\Factories\Reviews\ReviewFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('product_reviews')]
#[Fillable([
    'product_id',
    'author_name',
    'author_city',
    'rating',
    'title',
    'content',
    'skin_tone',
    'verified_at',
    'approved_at',
])]
class Review extends Model
{
    /** @use HasFactory<ReviewFactory> */
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function approved(): bool
    {
        return $this->approved_at !== null;
    }

    public function verified(): bool
    {
        return $this->verified_at !== null;
    }

    public function moderate(bool $approved, bool $verified): void
    {
        $this->forceFill([
            'approved_at' => $approved ? ($this->approved_at ?? now()) : null,
            'verified_at' => $verified ? ($this->verified_at ?? now()) : null,
        ])->save();
    }

    protected static function newFactory(): ReviewFactory
    {
        return ReviewFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'verified_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }
}
