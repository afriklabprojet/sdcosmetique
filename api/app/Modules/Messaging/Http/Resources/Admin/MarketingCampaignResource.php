<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Resources\Admin;

use App\Modules\Messaging\Models\MarketingCampaign;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * N'expose jamais d'ouvertures/clics/désabonnements : ce projet n'a aucun
 * fournisseur e-mail qui remonte ces statistiques, donc les inventer serait
 * fabriquer de la donnée (§8, explicitement interdit).
 *
 * @mixin MarketingCampaign
 */
class MarketingCampaignResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'subject' => $this->subject,
            'sender_name' => $this->sender_name,
            'sender_email' => $this->sender_email,
            'content' => $this->content,
            'audience_type' => $this->audience_type->value,
            'audience_client_ids' => $this->audience_client_ids,
            'status' => $this->status,
            'sendable' => $this->sendable(),
            'recipients_count' => $this->recipients_count,
            'sent_count' => $this->sent_count,
            'failed_count' => $this->failed_count,
            'created_by' => $this->createdBy?->name,
            'scheduled_at' => $this->scheduled_at,
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
        ];
    }
}
