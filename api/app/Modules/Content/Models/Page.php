<?php

declare(strict_types=1);

namespace App\Modules\Content\Models;

use App\Shared\Translations\HasTranslations;
use App\Shared\Translations\Translatable;
use Database\Factories\Content\PageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

#[Table('pages')]
#[Fillable(['slug', 'title', 'content', 'published_at'])]
#[Translatable(['title', 'content'])]
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory;

    use HasTranslations;

    public static function findBySlug(string $slug): ?self
    {
        return self::query()->where('slug', $slug)->first();
    }

    public function published(): bool
    {
        return $this->published_at !== null && $this->published_at->lessThanOrEqualTo(Carbon::now());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    protected static function newFactory(): PageFactory
    {
        return PageFactory::new();
    }
}
