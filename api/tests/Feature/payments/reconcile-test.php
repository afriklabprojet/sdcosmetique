<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Shopping\Models\Cart;
use App\Shared\Money;

it('expires a stale payment attempt and restores stock', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 50,
        'sale_price' => null,
        'stock' => 2,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);
    $cart = Cart::factory()->create();
    $cart->add($child, 1);
    $order = Order::factory()->draft()->create([
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'gateway' => 'null',
        'email' => 'guest@example.com',
    ]);
    $order->place();

    $payment = Payment::start($order, new Money($order->total->value));
    $attempt = $payment->attempts()->create([
        'gateway' => 'null',
        'reference' => 'STALE-1',
        'amount' => $order->total->value,
        'currency' => 'XOF',
        'initiated_at' => now()->subHours(3),
    ]);

    $this->artisan('payments:reconcile')->assertSuccessful();

    expect($attempt->fresh()->expired_at)->not->toBeNull()
        ->and($order->fresh()->cancelled_at)->not->toBeNull()
        ->and($child->fresh()->stock)->toBe(2);
});
