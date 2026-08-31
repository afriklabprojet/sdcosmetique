<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Resources\Admin;

use App\Modules\Quiz\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Option
 */
class OptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'description' => $this->description,
            'value_code' => $this->value_code,
            'glyph' => $this->glyph,
            'sort_order' => $this->sort_order,
            'archived' => $this->archived(),
        ];
    }
}
