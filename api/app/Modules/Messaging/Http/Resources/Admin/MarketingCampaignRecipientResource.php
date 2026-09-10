<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Resources\Admin;

use App\Modules\Messaging\Models\MarketingCampaignRecipient;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin MarketingCampaignRecipient
 */
class MarketingCampaignRecipientResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'client_id' => $this->client_id,
            'client_name' => $this->client?->user?->name,
            'email' => $this->email,
            'status' => $this->status,
            'error' => $this->error,
            'sent_at' => $this->sent_at,
        ];
    }
}
