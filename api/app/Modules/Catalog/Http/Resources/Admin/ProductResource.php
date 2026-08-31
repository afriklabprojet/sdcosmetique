<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Resources\Admin;

use App\Modules\Catalog\Models\Product;
use App\Shared\Translations\Translation;
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
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category_slug' => $this->whenLoaded('category', fn () => $this->category?->slug),
            'parent_id' => $this->parent_id,
            'slug' => $this->slug,
            'title' => $this->getRawOriginal('title'),
            'summary' => $this->getRawOriginal('summary'),
            'description' => $this->getRawOriginal('description'),
            'usage' => $this->getRawOriginal('usage'),
            'ingredients' => $this->ingredients,
            'sku' => $this->sku,
            'label' => $this->label,
            'regular_price' => $this->regular_price?->value,
            'sale_price' => $this->sale_price?->value,
            'stock' => (int) $this->stock,
            'visible_at' => $this->visible_at,
            'published_at' => $this->published_at,
            'images' => $this->whenLoaded('files', fn () => $this->files->map(fn ($file): array => [
                'id' => $file->id,
                'url' => $file->url,
            ])->values()),
            'badges' => $this->whenLoaded('badges', fn () => $this->badges->map(fn ($badge): array => [
                'id' => $badge->id,
                'label' => $badge->label,
                'type' => $badge->type,
            ])->values()),
            'children' => $this->whenLoaded('children', fn () => $this->children->map(fn (Product $child): array => [
                'id' => $child->id,
                'slug' => $child->slug,
                'sku' => $child->sku,
                'label' => $child->label,
                'regular_price' => $child->regular_price?->value,
                'sale_price' => $child->sale_price?->value,
                'stock' => (int) $child->stock,
            ])->values()),
            'translations' => $this->whenLoaded('translations', fn () => $this->translations->map(fn (Translation $t): array => [
                'locale' => $t->locale,
                'field' => $t->field,
                'value' => $t->value,
            ])->values()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
