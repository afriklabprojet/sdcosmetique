<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Resources;

use App\Modules\Loyalty\Models\Entry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Entry
 */
class EntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'points_delta' => $this->points_delta,
            'balance_after' => $this->balance_after,
            'reason' => $this->reason,
            'description' => $this->description,
            'reference_type' => $this->reference_type,
            'reference_id' => $this->reference_id,
            'created_at' => $this->created_at,
        ];
    }
}
