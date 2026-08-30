<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Resources\Admin;

use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_reference' => $this->order?->reference,
            'amount' => $this->amount?->value,
            'currency' => $this->currency,
            'status' => $this->status()->value,
            'paid_at' => $this->paid_at,
            'failed_at' => $this->failed_at,
            'created_at' => $this->created_at,
        ];
    }
}
