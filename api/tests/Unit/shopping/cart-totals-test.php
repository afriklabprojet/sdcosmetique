<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Enums\CouponType;
use App\Modules\Shopping\Models\Cart;
use App\Modules\Shopping\Models\Coupon;

it('adds a sellable product and quotes subtotal, discount and total', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 5,
    ]);
    $coupon = Coupon::factory()->create([
        'type' => CouponType::Percentage,
        'value' => 10,
    ]);
    $cart = Cart::factory()->create(['coupon_id' => $coupon->id]);

    $cart->add($child, 2);

    expect($cart->items()->count())->toBe(1)
        ->and($cart->subtotal()->value)->toBe(200)
        ->and($cart->discount()->value)->toBe(20)
        ->and($cart->total()->value)->toBe(180);
});

it('increments quantity when the same product is added twice', function (): void {
    $child = Product::factory()->child()->create(['regular_price' => 50, 'sale_price' => null]);
    $cart = Cart::factory()->create();

    $cart->add($child, 1);
    $cart->add($child, 2);

    expect($cart->items()->first()->quantity)->toBe(3);
});

it('clears lines and the coupon', function (): void {
    $child = Product::factory()->child()->create();
    $coupon = Coupon::factory()->create();
    $cart = Cart::factory()->create(['coupon_id' => $coupon->id]);
    $cart->add($child, 1);

    $cart->clear();

    expect($cart->items()->count())->toBe(0)
        ->and($cart->fresh()->coupon_id)->toBeNull();
});
