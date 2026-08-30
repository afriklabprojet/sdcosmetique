<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Resources\Admin;

use App\Modules\Catalog\Models\Category;
use App\Shared\Translations\Translation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'slug' => $this->slug,
            'name' => $this->getRawOriginal('name'),
            'description' => $this->getRawOriginal('description'),
            'image' => $this->image,
            'banner' => $this->banner,
            'order' => $this->order,
            'product_count' => $this->whenCounted('products'),
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
