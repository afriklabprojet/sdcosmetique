<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Enums\CouponType;
use App\Modules\Shopping\Models\Coupon;
use App\Modules\Shopping\Models\Shopper;
use App\Shared\Money;

it('calculates a percentage discount without exceeding the total', function (): void {
    $coupon = Coupon::factory()->create([
        'type' => CouponType::Percentage,
        'value' => 15,
        'threshold' => null,
    ]);

    expect($coupon->discount(new Money(1000))->value)->toBe(150);
});

it('caps a fixed discount at the total', function (): void {
    $coupon = Coupon::factory()->fixed(5000)->create();

    expect($coupon->discount(new Money(2000))->value)->toBe(2000);
});

it('returns zero when inactive or below threshold', function (): void {
    $expired = Coupon::factory()->create([
        'starts_at' => now()->subMonth(),
        'ends_at' => now()->subDay(),
    ]);
    $gated = Coupon::factory()->create(['threshold' => 5000]);

    expect($expired->active())->toBeFalse()
        ->and($expired->discount(new Money(9000))->value)->toBe(0)
        ->and($gated->discount(new Money(1000))->value)->toBe(0);
});

it('is drained when redemptions reach the global limit', function (): void {
    $coupon = Coupon::factory()->create(['limit' => 1]);
    $order = Order::factory()->create();

    expect($coupon->drained())->toBeFalse();

    $coupon->redemptions()->create([
        'email' => 'guest@example.com',
        'order_id' => $order->id,
    ]);

    expect($coupon->fresh()->drained())->toBeTrue()
        ->and($coupon->fresh()->discount(new Money(9000))->value)->toBe(0);
});

it('is exhausted for a shopper when their quota is met', function (): void {
    $client = Client::factory()->create();
    $coupon = Coupon::factory()->create(['quota' => 1]);
    $order = Order::factory()->create(['client_id' => $client->id, 'email' => $client->user->email]);
    $shopper = new Shopper($client, $client->user->email);

    expect($coupon->exhausted($shopper))->toBeFalse();

    $coupon->redemptions()->create([
        'client_id' => $client->id,
        'email' => $client->user->email,
        'order_id' => $order->id,
    ]);

    expect($coupon->fresh()->exhausted($shopper))->toBeTrue()
        ->and($coupon->fresh()->exhausted(new Shopper(email: 'other@example.com')))->toBeFalse();
});
