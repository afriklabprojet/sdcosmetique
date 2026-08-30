<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Resources;

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
        $this->loadMissing(['items', 'adjustments', 'deliveryMethod', 'cart.items.product']);

        $isOwner = $request->user()?->client !== null
            && $request->user()?->client?->id === $this->client_id;
        $isAdmin = (bool) $request->user()?->administrator();
        $isPrivileged = $isOwner || $isAdmin;

        return [
            'reference' => $this->reference,
            'status' => $this->status()->value,
            'step' => $this->step(),
            'email' => $isPrivileged ? $this->email : $this->maskEmail($this->email),
            'gateway' => $this->gateway,
            'currency' => $this->currency,
            'subtotal' => $this->subtotal->value,
            'total' => $this->total->value,
            'destination' => $isPrivileged ? $this->destination : $this->minimizeDestination($this->destination),
            'delivery_method' => $this->deliveryMethod === null ? null : [
                'id' => $this->deliveryMethod->id,
                'slug' => $this->deliveryMethod->slug,
                'name' => $this->deliveryMethod->name,
                'amount' => $this->deliveryMethod->amount->value,
            ],
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

    private function maskEmail(?string $email): ?string
    {
        if ($email === null || ! str_contains($email, '@')) {
            return null;
        }

        [$name, $domain] = explode('@', $email, 2);
        $len = strlen($name);

        if ($len <= 2) {
            $maskedName = substr($name, 0, 1).'*';
        } else {
            $maskedName = substr($name, 0, 1).str_repeat('*', max(1, $len - 2)).substr($name, -1);
        }

        return $maskedName.'@'.$domain;
    }

    /**
     * @param  array<string, mixed>|null  $destination
     * @return array<string, mixed>|null
     */
    private function minimizeDestination(?array $destination): ?array
    {
        if ($destination === null) {
            return null;
        }

        $firstName = (string) ($destination['first_name'] ?? '');
        $lastName = (string) ($destination['last_name'] ?? '');
        $recipient = trim($firstName.' '.(strlen($lastName) > 0 ? substr($lastName, 0, 1).'.' : ''));

        return [
            'recipient' => $recipient !== '' ? $recipient : null,
            'city' => $destination['city'] ?? null,
            'district' => $destination['district'] ?? null,
            'country' => $destination['country'] ?? null,
        ];
    }
}
