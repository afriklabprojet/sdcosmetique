<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Resources\Admin;

use App\Modules\Accounts\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Client
 */
class CustomerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'phone' => $this->phone,
            'orders_count' => $this->whenCounted('orders'),
            'total_value' => $this->value()->value,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
