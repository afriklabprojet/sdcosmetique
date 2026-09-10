<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Resources\Admin;

use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Fiche client complète (§4) — au-delà de `CustomerResource` (utilisée pour
 * la liste), ajoute l'adresse, les dates de première/dernière commande et le
 * panier moyen. L'adresse vient toujours de la commande la plus récente (la
 * même source que la facture PDF), jamais saisie manuellement ; à défaut de
 * commande, on retombe sur l'adresse par défaut du carnet d'adresses.
 *
 * @mixin Client
 */
class CustomerDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $placedOrders = $this->orders()->whereNotNull('placed_at');
        $firstOrder = (clone $placedOrders)->oldest('placed_at')->first();
        $lastOrder = (clone $placedOrders)->latest('placed_at')->first();
        $ordersCount = (clone $placedOrders)->count();
        $paidCount = (clone $placedOrders)->whereNotNull('paid_at')->count();
        $totalValue = $this->value()->value;

        return [
            'id' => $this->id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'address' => $this->address($lastOrder),
            'orders_count' => $ordersCount,
            'total_value' => $totalValue,
            'average_basket' => $paidCount > 0 ? intdiv($totalValue, $paidCount) : 0,
            'first_order_at' => $firstOrder?->placed_at,
            'last_order_at' => $lastOrder?->placed_at,
            'last_order' => $lastOrder === null ? null : [
                'reference' => $lastOrder->reference,
                'total' => $lastOrder->total->value,
                'status' => $lastOrder->status()->value,
                'placed_at' => $lastOrder->placed_at,
            ],
            'created_at' => $this->created_at,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function address(?Order $lastOrder): ?array
    {
        $destination = $lastOrder?->destination;

        if (is_array($destination) && $destination !== []) {
            return [
                'line' => trim(($destination['line_1'] ?? '').' '.($destination['line_2'] ?? '')),
                'city' => $destination['city'] ?? null,
                'country' => $destination['country'] ?? null,
            ];
        }

        $fallback = $this->defaults()->shipping();

        if ($fallback === null) {
            return null;
        }

        return [
            'line' => trim($fallback->line_1.' '.(string) $fallback->line_2),
            'city' => $fallback->city,
            'country' => $fallback->country,
        ];
    }
}
