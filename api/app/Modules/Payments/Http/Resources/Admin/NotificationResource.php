<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Resources\Admin;

use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Notification
 */
class NotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gateway' => $this->gateway,
            'reference' => $this->reference,
            'payment_attempt_id' => $this->payment_attempt_id,
            'failure_reason' => $this->failure_reason,
            'handled_at' => $this->handled_at,
            'done' => $this->done(),
            'payload' => $this->when($request->routeIs('*.show'), $this->payload),
            'created_at' => $this->created_at,
        ];
    }
}
