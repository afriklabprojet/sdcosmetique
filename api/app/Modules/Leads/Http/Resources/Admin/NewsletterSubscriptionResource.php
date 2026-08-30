<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Resources\Admin;

use App\Modules\Leads\Models\Newsletter\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Subscription
 */
class NewsletterSubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'confirmed_at' => $this->confirmed_at,
            'unsubscribed_at' => $this->unsubscribed_at,
            'active' => $this->active(),
            'created_at' => $this->created_at,
        ];
    }
}
