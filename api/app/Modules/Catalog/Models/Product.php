<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Modules\Catalog\Domain\Stock;
use App\Modules\Catalog\Models\Product\Pricing;
use App\Shared\Casts\Money as MoneyCast;
use App\Shared\Storefront\RevalidatesStorefront;
use App\Shared\Translations\HasTranslations;
use App\Shared\Translations\Translatable;
use Database\Factories\Catalog\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Carbon;

#[Table('products')]
#[Fillable([
    'category_id',
    'parent_id',
    'slug',
    'title',
    'summary',
    'description',
    'ingredients',
    'usage',
    'sku',
    'label',
    'regular_price',
    'sale_price',
    'stock',
    'visible_at',
    'published_at',
])]
#[Translatable(['title', 'summary', 'description', 'usage'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    use HasTranslations;
    use RevalidatesStorefront;

    public static function findBySlug(string $slug): ?self
    {
        return self::query()->where('slug', $slug)->first();
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    /**
     * @return HasMany<Product\Badge, $this>
     */
    public function badges(): HasMany
    {
        return $this->hasMany(Product\Badge::class);
    }

    /**
     * @return MorphMany<File, $this>
     */
    public function files(): MorphMany
    {
        return $this->morphMany(File::class, 'fileable');
    }

    public function child(): ?self
    {
        return $this->children()->orderBy('id')->first();
    }

    public function sellable(): bool
    {
        if ($this->regular_price === null) {
            return false;
        }

        return $this->parent_id !== null || $this->children()->doesntExist();
    }

    /**
     * @return Collection<int, Product>
     */
    public function related(): Collection
    {
        return self::query()
            ->where('category_id', $this->category_id)
            ->whereNull('parent_id')
            ->whereKeyNot($this->parent_id ?? $this->id)
            ->whereNotNull('published_at')
            ->limit(8)
            ->get();
    }

    public function recent(): bool
    {
        if ($this->published_at === null) {
            return false;
        }

        return $this->published_at->greaterThanOrEqualTo(Carbon::now()->subDays(30));
    }

    public function visible(): bool
    {
        $now = Carbon::now();

        if ($this->visible_at !== null && $this->visible_at->greaterThan($now)) {
            return false;
        }

        return $this->published_at !== null && $this->published_at->lessThanOrEqualTo($now);
    }

    public function inventory(): Stock
    {
        return new Stock($this);
    }

    public function take(int $quantity): void
    {
        $this->inventory()->take($quantity);
    }

    public function restore(int $quantity): void
    {
        $this->inventory()->restore($quantity);
    }

    public function pricing(): Pricing
    {
        return new Pricing($this);
    }

    public function featured(): bool
    {
        return $this->badges->contains(
            fn (Product\Badge $badge): bool => $badge->type === 'featured',
        );
    }

    #[Scope]
    protected function listed(Builder $query): void
    {
        $query->whereNull('parent_id')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->where(function (Builder $builder): void {
                $builder->whereNull('visible_at')->orWhere('visible_at', '<=', now());
            });
    }

    #[Scope]
    protected function priced(Builder $query): void
    {
        $query->select('products.*')->selectSub(
            static::query()
                ->from('products as children')
                ->selectRaw('COALESCE(children.sale_price, children.regular_price, 0)')
                ->whereColumn('children.parent_id', 'products.id')
                ->orderBy('children.id')
                ->limit(1),
            'display_price',
        );
    }

    /**
     * @return list<string>
     */
    protected static function storefrontCacheTags(): array
    {
        return ['products'];
    }

    protected static function newFactory(): ProductFactory
    {
        return ProductFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'ingredients' => 'array',
            'regular_price' => MoneyCast::class,
            'sale_price' => MoneyCast::class,
            'stock' => 'integer',
            'visible_at' => 'datetime',
            'published_at' => 'datetime',
        ];
    }
}
