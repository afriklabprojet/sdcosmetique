<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Resources;

use App\Modules\Accounts\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Address
 */
class AddressResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return $this->snapshot() + [
            'id' => $this->id,
        ];
    }
}
