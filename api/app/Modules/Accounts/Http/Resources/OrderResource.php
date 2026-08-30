<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Resources;

use App\Modules\Orders\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['items', 'adjustments', 'deliveryMethod']);

        return [
            'reference' => $this->reference,
            'status' => $this->status()->value,
            'email' => $this->email,
            'gateway' => $this->gateway,
            'currency' => $this->currency,
            'subtotal' => $this->subtotal->value,
            'total' => $this->total->value,
            'destination' => $this->destination,
            'items' => $this->items->map(fn ($item): array => [
                'title' => $item->title,
                'label' => $item->label,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price->value,
                'total' => $item->total->value,
            ])->values(),
            'adjustments' => $this->adjustments->map(fn ($adjustment): array => [
                'type' => $adjustment->type->value,
                'operation' => $adjustment->operation->value,
                'amount' => $adjustment->amount->value,
                'label' => $adjustment->label,
            ])->values(),
            'placed_at' => $this->placed_at,
            'paid_at' => $this->paid_at,
        ];
    }
}
