<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Coupon;

it('creates a guest cart and adds a sellable child', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 25,
        'sale_price' => null,
        'stock' => 5,
    ]);

    $this->getJson('/v1/cart')
        ->assertOk()
        ->assertJsonPath('data.items', [])
        ->assertCookie('guest_token');

    $this->postJson('/v1/cart-items', [
        'product' => $child->slug,
        'quantity' => 2,
    ])->assertCreated()
        ->assertJsonPath('data.total', 50)
        ->assertJsonPath('data.items.0.quantity', 2);

    $this->getJson('/v1/cart')
        ->assertOk()
        ->assertJsonPath('data.total', 50);
});

it('applies and removes a valid coupon', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 5,
    ]);
    Coupon::factory()->create([
        'code' => 'SAVE10',
        'value' => 10,
    ]);

    $this->postJson('/v1/cart-items', [
        'product' => $child->slug,
        'quantity' => 1,
    ])->assertCreated();

    $this->postJson('/v1/cart-coupon', ['code' => 'SAVE10'])
        ->assertOk()
        ->assertJsonPath('data.discount', 10)
        ->assertJsonPath('data.total', 90);

    $this->deleteJson('/v1/cart-coupon/current')
        ->assertOk()
        ->assertJsonPath('data.discount', 0)
        ->assertJsonPath('data.coupon', null);
});

it('rejects an inactive coupon', function (): void {
    Coupon::factory()->create([
        'code' => 'OLD',
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->subDay(),
    ]);

    $this->postJson('/v1/cart-coupon', ['code' => 'OLD'])
        ->assertUnprocessable();
});

it('rejects a drained coupon', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 5,
    ]);
    $coupon = Coupon::factory()->create([
        'code' => 'GONE',
        'limit' => 1,
    ]);
    $coupon->redemptions()->create([
        'email' => 'prior@example.com',
        'order_id' => Order::factory()->create()->id,
    ]);

    $this->postJson('/v1/cart-items', [
        'product' => $child->slug,
        'quantity' => 1,
    ])->assertCreated();

    $this->postJson('/v1/cart-coupon', ['code' => 'GONE'])
        ->assertUnprocessable();
});
