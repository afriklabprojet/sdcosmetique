<?php

declare(strict_types=1);

namespace App\Modules\Content\Models;

use App\Shared\Storefront\RevalidatesStorefront;
use App\Shared\Translations\HasTranslations;
use App\Shared\Translations\Translatable;
use Database\Factories\Content\BannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

#[Table('banners')]
#[Fillable(['key', 'title', 'subtitle', 'image_url', 'link_url', 'order', 'visible_at', 'metadata'])]
#[Translatable(['title', 'subtitle'])]
class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    use HasTranslations;
    use RevalidatesStorefront;

    public function visible(): bool
    {
        return $this->visible_at !== null && $this->visible_at->lessThanOrEqualTo(Carbon::now());
    }

    /**
     * @return list<string>
     */
    protected static function storefrontCacheTags(): array
    {
        return ['banners'];
    }

    protected static function newFactory(): BannerFactory
    {
        return BannerFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'visible_at' => 'datetime',
        ];
    }
}
