<?php

declare(strict_types=1);

namespace App\Modules\Pos\Domain;

use App\Models\User;
use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\Order\Item;
use App\Modules\Pos\Enums\PosTenderMethod;
use App\Modules\Pos\Models\AuditLog;
use App\Modules\Pos\Models\Refund;
use App\Modules\Pos\Models\Refund\Item as RefundItem;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Remboursement d'une vente caisse (§21) — total ou partiel, par ligne et
 * quantité. Une commande peut être remboursée en plusieurs fois (ex. deux
 * articles rendus à des dates différentes) : chaque appel crée un `Refund`
 * cumulatif, restaure le stock des seules quantités concernées, et ne marque
 * `Order::refunded_at` (réutilise le garde-fou existant, sans le dupliquer)
 * que lorsque le cumul remboursé atteint le total de la commande.
 */
class PosRefund
{
    /**
     * @param  array<int, array{order_item_id: int, quantity: int}>|null  $items  null ou vide = rembourse tout ce qui reste
     */
    public function refund(
        Order $order,
        string $reason,
        PosTenderMethod $method,
        Admin $admin,
        User $by,
        ?array $items = null,
        ?Request $request = null,
    ): Refund {
        if ($order->paid_at === null) {
            throw new DomainException('Seule une vente réglée peut être remboursée.');
        }

        return DB::transaction(function () use ($order, $reason, $method, $admin, $by, $items, $request): Refund {
            $order->loadMissing('items.product');
            $alreadyRefunded = $this->refundedQuantitiesByItem($order);

            $lines = $this->resolveLines($order, $items, $alreadyRefunded);

            if ($lines === []) {
                throw new DomainException('Il ne reste rien à rembourser sur cette vente.');
            }

            $discountRatio = $this->discountRatio($order);
            $refund = Refund::query()->create([
                'order_id' => $order->id,
                'admin_id' => $admin->id,
                'amount' => 0,
                'method' => $method->value,
                'reason' => $reason,
                'created_at' => now(),
            ]);

            $totalRefunded = 0;

            foreach ($lines as $line) {
                [$item, $quantity] = $line;
                $lineAmount = (int) round($item->unit_price->value * $quantity * (1 - $discountRatio));
                $totalRefunded += $lineAmount;

                $refund->items()->create([
                    'order_item_id' => $item->id,
                    'quantity' => $quantity,
                    'amount' => $lineAmount,
                ]);

                $item->product->restore($quantity);
            }

            $refund->forceFill(['amount' => $totalRefunded])->save();

            $existing = is_string($order->note) ? trim($order->note) : '';
            $note = $existing === '' ? $reason : $existing."\n".$reason;
            $order->forceFill(['note' => $note])->save();

            $cumulativeRefunded = $this->totalRefunded($order);
            $fullyRefunded = $cumulativeRefunded >= $order->total->value;

            if ($fullyRefunded) {
                $order->refund();
            }

            AuditLog::record(AuditLog::SALE_REFUNDED, $order, $by, new_values: [
                'reference' => $order->reference,
                'reason' => $reason,
                'amount' => $totalRefunded,
                'method' => $method->value,
                'full' => $fullyRefunded,
            ], request: $request);

            return $refund->load('items');
        });
    }

    /** Somme des remboursements déjà enregistrés pour cette commande, tous remboursements confondus. */
    public function totalRefunded(Order $order): int
    {
        return (int) Refund::query()->where('order_id', $order->id)->sum('amount');
    }

    public function refundStatus(Order $order): string
    {
        $refunded = $this->totalRefunded($order);

        if ($refunded <= 0) {
            return 'none';
        }

        return $refunded >= $order->total->value ? 'full' : 'partial';
    }

    /**
     * @return array<int, int> quantité déjà remboursée par order_item_id
     */
    private function refundedQuantitiesByItem(Order $order): array
    {
        return RefundItem::query()
            ->whereIn('order_item_id', $order->items->pluck('id'))
            ->selectRaw('order_item_id, sum(quantity) as qty')
            ->groupBy('order_item_id')
            ->pluck('qty', 'order_item_id')
            ->map(fn ($qty) => (int) $qty)
            ->all();
    }

    /**
     * @param  array<int, array{order_item_id: int, quantity: int}>|null  $requested
     * @param  array<int, int>  $alreadyRefunded
     * @return array<int, array{0: Item, 1: int}>
     */
    private function resolveLines(Order $order, ?array $requested, array $alreadyRefunded): array
    {
        $lines = [];

        if ($requested === null || $requested === []) {
            // Aucune sélection : rembourse tout ce qui n'est pas déjà remboursé.
            foreach ($order->items as $item) {
                $remaining = $item->quantity - ($alreadyRefunded[$item->id] ?? 0);
                if ($remaining > 0) {
                    $lines[] = [$item, $remaining];
                }
            }

            return $lines;
        }

        foreach ($requested as $line) {
            $item = $order->items->firstWhere('id', (int) $line['order_item_id']);

            if ($item === null) {
                throw new DomainException('Article introuvable sur cette vente.');
            }

            $quantity = (int) $line['quantity'];
            $remaining = $item->quantity - ($alreadyRefunded[$item->id] ?? 0);

            if ($quantity < 1 || $quantity > $remaining) {
                throw new DomainException("Quantité de remboursement invalide pour « {$item->title} » ({$remaining} restant(s)).");
            }

            $lines[] = [$item, $quantity];
        }

        return $lines;
    }

    /** Part du total absorbée par la remise (0 si aucune remise) — répartie proportionnellement sur chaque ligne remboursée. */
    private function discountRatio(Order $order): float
    {
        $subtotal = $order->subtotal->value;

        if ($subtotal <= 0) {
            return 0.0;
        }

        return max(0.0, min(1.0, 1 - ($order->total->value / $subtotal)));
    }
}
