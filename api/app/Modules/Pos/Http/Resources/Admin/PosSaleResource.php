<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Resources\Admin;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Pos\Domain\PosRefund;
use App\Modules\Pos\Models\Refund\Item as RefundItem;
use App\Shared\Receipt\ReceiptQrCode;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 *
 * `Order` (module « cœur ») n'expose pas de relation vers `Payment`/`Admin`
 * (voir la note sur `Order::pos()`) — ce module, construit par-dessus, va
 * chercher lui-même ces informations dans l'autre sens.
 */
class PosSaleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['items', 'adjustments', 'client.user']);

        $cashier = $this->served_by !== null ? Admin::query()->with('user')->find($this->served_by) : null;

        $tenders = Payment::query()
            ->where('order_id', $this->id)
            ->with('attempts')
            ->get()
            ->flatMap(
                fn ($payment) => $payment->attempts->map(function ($attempt): array {
                    // En attente de webhook (Jeko) : ni confirmé, ni échoué —
                    // le client doit encore payer via le lien/QR fourni.
                    $pending = $attempt->confirmed_at === null && $attempt->failed_at === null;

                    return [
                        'method' => str_replace('pos_', '', (string) $attempt->gateway),
                        'amount' => $attempt->amount->value,
                        'received' => $attempt->received_amount?->value,
                        'change' => $attempt->received_amount !== null ? max(0, $attempt->received_amount->value - $attempt->amount->value) : 0,
                        'pending' => $pending,
                        'redirect_url' => $pending ? $attempt->redirect_url : null,
                        'qr_image' => $pending && $attempt->redirect_url !== null ? ReceiptQrCode::dataUri($attempt->redirect_url) : null,
                    ];
                }),
            )->values();

        $refundedByItem = RefundItem::query()
            ->whereIn('order_item_id', $this->items->pluck('id'))
            ->selectRaw('order_item_id, sum(quantity) as qty')
            ->groupBy('order_item_id')
            ->pluck('qty', 'order_item_id');

        $posRefund = new PosRefund;

        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'status' => $this->status()->value,
            'channel' => $this->channel,
            'customer' => [
                'client_id' => $this->client_id,
                'name' => $this->client?->user?->name
                    ?? ($this->destination['first_name'] ?? null)
                    ?? 'Client de passage',
                'phone' => $this->client?->phone ?? ($this->destination['phone'] ?? null),
                'email' => $this->email,
            ],
            'cashier' => $cashier?->user?->name,
            'subtotal' => $this->subtotal->value,
            'total' => $this->total->value,
            'currency' => $this->currency,
            'items' => $this->items->map(fn ($item): array => [
                'id' => $item->id,
                'title' => $item->title,
                'label' => $item->label,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price->value,
                'total' => $item->total->value,
                'refunded_quantity' => (int) ($refundedByItem[$item->id] ?? 0),
            ])->values(),
            'adjustments' => $this->adjustments->map(fn ($adjustment): array => [
                'type' => $adjustment->type->value,
                'operation' => $adjustment->operation->value,
                'amount' => $adjustment->amount->value,
                'label' => $adjustment->label,
            ])->values(),
            'tenders' => $tenders,
            'note' => $this->note,
            'placed_at' => $this->placed_at,
            'paid_at' => $this->paid_at,
            'refunded_at' => $this->refunded_at,
            'refund_status' => $posRefund->refundStatus($this->resource),
            'refunded_amount' => $posRefund->totalRefunded($this->resource),
        ];
    }
}
