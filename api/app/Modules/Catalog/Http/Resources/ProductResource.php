<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Resources;

use App\Modules\Catalog\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['category', 'children', 'badges', 'files']);

        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'summary' => $this->summary,
            'description' => $this->description,
            'usage' => $this->usage,
            'ingredients' => $this->ingredients,
            'category' => new CategoryResource($this->category),
            'price' => $this->pricing()->display(),
            'compare_at_price' => $this->pricing()->compare(),
            'stock' => $this->inventory()->effective(),
            'in_stock' => $this->inventory()->available(),
            'recent' => $this->recent(),
            'featured' => $this->featured(),
            'images' => $this->files->pluck('url')->values(),
            'badges' => $this->badges
                ->reject(fn ($badge): bool => $badge->type === 'featured')
                ->pluck('label')
                ->values(),
            'children' => $this->children->map(fn (Product $child): array => [
                'slug' => $child->slug,
                'sku' => $child->sku,
                'label' => $child->label,
                'price' => $child->pricing()->unit(),
                'compare_at_price' => $child->sale_price === null ? null : $child->regular_price->value,
                'stock' => (int) $child->stock,
                'in_stock' => $child->inventory()->available(),
            ])->values(),
        ];
    }
}
