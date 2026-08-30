<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Resources\Admin;

use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Method
 */
class DeliveryMethodResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'zone' => $this->zone,
            'carrier' => $this->carrier,
            'amount' => $this->amount?->value,
            'cost' => $this->cost?->value,
            'position' => $this->position,
            'visible_at' => $this->visible_at,
            'visible' => $this->visible(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
