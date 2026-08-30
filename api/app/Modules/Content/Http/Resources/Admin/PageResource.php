<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Resources\Admin;

use App\Modules\Content\Models\Page;
use App\Shared\Translations\Translation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Page
 */
class PageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->getRawOriginal('title'),
            'content' => $this->getRawOriginal('content'),
            'published_at' => $this->published_at,
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
