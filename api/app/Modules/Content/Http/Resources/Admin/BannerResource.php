<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Resources\Admin;

use App\Modules\Content\Models\Banner;
use App\Shared\Translations\Translation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Banner
 */
class BannerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'title' => $this->getRawOriginal('title'),
            'subtitle' => $this->getRawOriginal('subtitle'),
            'image_url' => $this->image_url,
            'link_url' => $this->link_url,
            'order' => $this->order,
            'visible_at' => $this->visible_at,
            'metadata' => $this->metadata,
            'translations' => $this->translations->map(fn (Translation $t): array => [
                'locale' => $t->locale,
                'field' => $t->field,
                'value' => $t->value,
            ])->values(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
