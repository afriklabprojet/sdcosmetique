<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\OrderNumberCounter;
use App\Modules\Shopping\Models\Cart;

it('assigns only a throwaway placeholder reference to a draft, never shown to anyone', function (): void {
    $order = Order::factory()->draft()->create(['reference' => null]);

    expect($order->reference)->toStartWith('DRAFT-');
});

it('gives a real order a short, structured, sequential reference — not a random string', function (): void {
    $year = (int) now()->year;
    OrderNumberCounter::query()->where('year', $year)->delete();

    $reference = Order::nextStructuredReference();

    expect($reference)->toBe(sprintf('CMD-%d-%06d', $year, 1))
        ->and(Order::nextStructuredReference())->toBe(sprintf('CMD-%d-%06d', $year, 2));
});

it('never generates two structured references with the same number', function (): void {
    $references = collect(range(1, 20))->map(fn () => Order::nextStructuredReference());

    expect($references->unique())->toHaveCount(20);
});

it('assigns the final structured reference only once an order is actually placed, not while it is a draft', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create(['regular_price' => 50, 'sale_price' => null, 'stock' => 3]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);
    $cart = Cart::factory()->create();
    $cart->add($child, 1);
    $order = Order::factory()->draft()->create([
        'reference' => null,
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'gateway' => 'null',
        'email' => 'guest@example.com',
    ]);

    expect($order->reference)->toStartWith('DRAFT-');

    $order->place();

    expect($order->fresh()->reference)->toMatch('/^CMD-\d{4}-\d{6}$/');
});

it('refunds a paid order without touching its logistics status', function (): void {
    $order = Order::factory()->paid()->create();
    $order->ship();

    $order->refund();

    expect($order->fresh()->refunded_at)->not->toBeNull()
        ->and($order->fresh()->status()->value)->toBe('shipped');
});

it('refuses to refund an order that was never paid', function (): void {
    $order = Order::factory()->placed()->create();

    expect(fn () => $order->refund())->toThrow(DomainException::class);
});

it('is a no-op to refund an already-refunded order', function (): void {
    $order = Order::factory()->paid()->create();
    $order->refund();
    $refundedAt = $order->fresh()->refunded_at;

    $order->refresh()->refund();

    expect($order->fresh()->refunded_at->equalTo($refundedAt))->toBeTrue();
});

it('discards an unpaid order and restores its reserved stock', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 50,
        'sale_price' => null,
        'stock' => 3,
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

    expect($child->fresh()->stock)->toBe(2);

    $orderId = $order->id;
    $order->discard();

    expect($child->fresh()->stock)->toBe(3)
        ->and(Order::find($orderId))->toBeNull();
});

it('does not double-restore stock when discarding an already-cancelled order', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 50,
        'sale_price' => null,
        'stock' => 3,
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
    $order->cancel('Client request');

    expect($child->fresh()->stock)->toBe(3);

    $order->discard();

    expect($child->fresh()->stock)->toBe(3);
});

it('refuses to discard a paid order', function (): void {
    $order = Order::factory()->paid()->create();

    expect(fn () => $order->discard())->toThrow(DomainException::class);
});
