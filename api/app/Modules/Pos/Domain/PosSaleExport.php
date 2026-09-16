<?php

declare(strict_types=1);

namespace App\Modules\Pos\Domain;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Modules\Pos\Http\Resources\Admin\PosSaleResource;
use Illuminate\Database\Eloquent\Collection;

/** Lignes communes aux exports PDF et CSV de l'historique caisse (§20) — même résolution vendeur/statut que {@see PosSaleResource}. */
final class PosSaleExport
{
    public function __construct(private readonly PosRefund $posRefund) {}

    /**
     * @param  Collection<int, Order>  $orders
     * @return list<array{reference: string, placed_at: mixed, customer: string, cashier: string, total: int, status: string}>
     */
    public function rows(Collection $orders): array
    {
        $orders->loadMissing('client.user');

        $cashiers = Admin::query()
            ->with('user')
            ->whereIn('id', $orders->pluck('served_by')->filter()->unique())
            ->get()
            ->keyBy('id');

        $statusLabels = ['none' => 'Payée', 'partial' => 'Partiellement remboursée', 'full' => 'Remboursée'];

        return $orders->map(fn (Order $order): array => [
            'reference' => $order->reference,
            'placed_at' => $order->placed_at,
            'customer' => $order->client?->user?->name ?? ($order->destination['first_name'] ?? null) ?? 'Client de passage',
            'cashier' => $order->served_by !== null ? ($cashiers->get($order->served_by)?->user?->name ?? '—') : '—',
            'total' => $order->total->value,
            'status' => $statusLabels[$this->posRefund->refundStatus($order)],
        ])->values()->all();
    }
}
