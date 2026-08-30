<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Domain\Checkout;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Enums\CouponType;
use App\Modules\Shopping\Models\Cart;
use App\Modules\Shopping\Models\Coupon;

it('places a draft once, snapshots lines, takes stock and nulls the cart pointer', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 4,
    ]);
    $method = Method::factory()->create(['amount' => 20, 'cost' => 10]);
    $cart = Cart::factory()->create();
    $cart->add($child, 2);
    $order = Order::factory()->draft()->create([
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'email' => 'guest@example.com',
        'gateway' => 'null',
        'subtotal' => 0,
        'total' => 0,
    ]);

    $order->place();
    $order->place();

    $order->refresh();

    expect($order->placed_at)->not->toBeNull()
        ->and($order->cart_id)->toBeNull()
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->quantity)->toBe(2)
        ->and($order->subtotal->value)->toBe(200)
        ->and($order->total->value)->toBe(220)
        ->and($child->fresh()->stock)->toBe(2)
        ->and($order->delivery)->not->toBeNull();
});

it('is a no-op on a second place so stock is not taken twice', function (): void {
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
    ]);

    $order->place();
    $order->place();

    expect($child->fresh()->stock)->toBe(2)
        ->and($order->items()->count())->toBe(1);
});

it('appends the cancellation reason without overwriting an existing note', function (): void {
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
        'note' => 'Leave at the gate',
    ]);

    $order->place();
    $order->cancel('Payment attempt expired.');

    expect($order->fresh()->note)->toBe("Leave at the gate\nPayment attempt expired.")
        ->and($order->fresh()->cancelled_at)->not->toBeNull()
        ->and($child->fresh()->stock)->toBe(3);
});

it('records a coupon redemption on place and frees it on cancel', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 3,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);
    $coupon = Coupon::factory()->create([
        'type' => CouponType::Fixed,
        'value' => 10,
        'limit' => 1,
    ]);
    $cart = Cart::factory()->create(['coupon_id' => $coupon->id]);
    $cart->add($child, 1);
    $order = Order::factory()->draft()->create([
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'gateway' => 'null',
        'email' => 'guest@example.com',
    ]);

    $order->place();

    expect($coupon->fresh()->drained())->toBeTrue()
        ->and($coupon->redemptions()->where('order_id', $order->id)->exists())->toBeTrue()
        ->and($order->fresh()->total->value)->toBe(90);

    $order->cancel('Customer changed mind.');

    expect($coupon->fresh()->drained())->toBeFalse()
        ->and($coupon->redemptions()->where('order_id', $order->id)->exists())->toBeFalse();
});

it('refuses place when the coupon limit is already drained', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 50,
        'sale_price' => null,
        'stock' => 3,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);
    $coupon = Coupon::factory()->create(['limit' => 1]);
    $prior = Order::factory()->create(['email' => 'other@example.com']);
    $coupon->redemptions()->create([
        'email' => 'other@example.com',
        'order_id' => $prior->id,
    ]);
    $cart = Cart::factory()->create(['coupon_id' => $coupon->id]);
    $cart->add($child, 1);
    $order = Order::factory()->draft()->create([
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'gateway' => 'null',
        'email' => 'guest@example.com',
    ]);

    $order->place();
})->throws(\DomainException::class, 'This coupon is no longer available.');

it('commits checkout through Checkout domain noun', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 150,
        'sale_price' => null,
        'stock' => 5,
    ]);
    $method = Method::factory()->create(['amount' => 15, 'cost' => 5]);
    $cart = Cart::factory()->create();
    $cart->add($child, 1);
    $order = Order::factory()->draft()->create([
        'cart_id' => $cart->id,
        'delivery_method_id' => $method->id,
        'email' => 'customer@example.com',
        'gateway' => 'null',
        'subtotal' => 0,
        'total' => 0,
    ]);

    (new Checkout($order))->commit();

    $order->refresh();

    expect($order->placed_at)->not->toBeNull()
        ->and($order->cart_id)->toBeNull()
        ->and($order->items)->toHaveCount(1)
        ->and($order->subtotal->value)->toBe(150)
        ->and($order->total->value)->toBe(165)
        ->and($child->fresh()->stock)->toBe(4);
});
