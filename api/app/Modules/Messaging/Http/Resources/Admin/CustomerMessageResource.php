<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Resources\Admin;

use App\Modules\Messaging\Models\CustomerMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CustomerMessage
 */
class CustomerMessageResource extends JsonResource
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
            'channel' => $this->channel,
            'subject' => $this->subject,
            'body' => $this->body,
            'recipient_email' => $this->recipient_email,
            'status' => $this->status,
            'error' => $this->error,
            'sent_by' => $this->sentBy?->name,
            'sent_at' => $this->sent_at,
            'created_at' => $this->created_at,
        ];
    }
}
