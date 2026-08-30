<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Resources\Admin;

use App\Modules\Shopping\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Coupon
 */
class CouponResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type->value,
            'value' => $this->value,
            'threshold' => $this->threshold?->value,
            'limit' => $this->limit,
            'quota' => $this->quota,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'active' => $this->active(),
            'redemptions_count' => $this->whenCounted('redemptions'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
