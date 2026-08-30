<?php

declare(strict_types=1);

namespace App\Modules\Orders\Domain;

use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Coupon;
use App\Modules\Shopping\Models\Shopper;
use DomainException;
use Illuminate\Support\Facades\DB;

class Checkout
{
    public function __construct(
        public Order $order,
    ) {}

    public function step(): string
    {
        return $this->order->step();
    }

    public function ready(): bool
    {
        return $this->step() === 'review';
    }

    public function commit(): void
    {
        if ($this->order->placed_at !== null) {
            return;
        }

        if ($this->order->guest() && ($this->order->email === null || $this->order->email === '')) {
            throw new DomainException('Guest orders require an email.');
        }

        if ($this->order->delivery_method_id === null) {
            throw new DomainException('A delivery method is required.');
        }

        if ($this->order->gateway === null || $this->order->gateway === '') {
            throw new DomainException('A payment method is required.');
        }

        if ($this->order->destination === null) {
            throw new DomainException('A destination is required.');
        }

        $cart = $this->order->cart;

        if ($cart === null || $cart->items()->doesntExist()) {
            throw new DomainException('The cart is empty.');
        }

        DB::transaction(function () use ($cart): void {
            $cart->load(['items.product.parent', 'coupon', 'items.product']);
            $method = $this->order->deliveryMethod()->firstOrFail();

            foreach ($cart->items as $item) {
                $product = $item->product;
                $product->take($item->quantity);
                $unitPrice = $product->pricing()->unit();

                $this->order->items()->create([
                    'product_id' => $product->id,
                    'title' => $product->parent?->title ?? $product->title,
                    'label' => $product->label,
                    'unit_price' => $unitPrice,
                    'quantity' => $item->quantity,
                    'total' => $unitPrice * $item->quantity,
                ]);
            }

            $amount = $method->amount;
            $this->order->adjust(AdjustmentType::Shipping, $amount, $method->name);

            if ($cart->coupon_id !== null) {
                $coupon = Coupon::query()->whereKey($cart->coupon_id)->lockForUpdate()->first();
                $shopper = new Shopper($this->order->client, $this->order->email);

                if ($coupon === null || $coupon->drained() || $coupon->exhausted($shopper)) {
                    throw new DomainException('This coupon is no longer available.');
                }

                $discount = $coupon->discount($cart->subtotal());

                if ($discount->value > 0) {
                    $this->order->adjust(AdjustmentType::Discount, $discount, $coupon->code);
                }

                $coupon->redemptions()->create([
                    'client_id' => $this->order->client_id,
                    'email' => $this->order->email,
                    'order_id' => $this->order->id,
                ]);
            }

            $this->order->delivery()->create([
                'carrier' => $method->carrier,
                'cost' => $method->cost,
            ]);

            $cart->clear();

            $this->order->forceFill([
                'placed_at' => now(),
                'cart_id' => null,
            ])->save();

            $this->order->recalculate();
        });
    }
}
