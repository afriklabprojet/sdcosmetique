<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Resources\Admin;

use App\Modules\Loyalty\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Account
 */
class AccountResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing('client.user');

        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'email' => $this->client?->user?->email,
            'name' => $this->client?->user?->name,
            'current_points' => $this->current_points,
            'lifetime_points' => $this->lifetime_points,
            'tier' => $this->tier,
            'tier_at' => $this->tier_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
