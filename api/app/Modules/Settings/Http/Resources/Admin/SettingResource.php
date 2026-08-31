<?php

declare(strict_types=1);

namespace App\Modules\Settings\Http\Resources\Admin;

use App\Modules\Settings\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Setting
 */
class SettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'value' => $this->value,
            'is_public' => $this->is_public,
            'updated_at' => $this->updated_at,
        ];
    }
}
