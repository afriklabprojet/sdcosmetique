<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Orders\Models\Order;

it('guards order endpoints', function (): void {
    $this->getJson('/v1/admin/orders')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/orders')->assertForbidden();
});

it('lists placed orders and shows one', function (): void {
    Order::factory()->placed()->create();
    Order::factory()->draft()->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/orders')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('transitions an order through shipped and delivered', function (): void {
    $order = Order::factory()->placed()->create();

    $this->actingAs(admin());

    $this->patchJson('/v1/admin/orders/'.$order->id, ['status' => 'shipped'])
        ->assertOk()
        ->assertJsonPath('data.status', 'shipped');

    $this->patchJson('/v1/admin/orders/'.$order->id, ['status' => 'delivered'])
        ->assertOk()
        ->assertJsonPath('data.status', 'delivered');
});

it('cancels an unpaid order with a reason', function (): void {
    $order = Order::factory()->placed()->create();

    $this->actingAs(admin());

    $this->patchJson('/v1/admin/orders/'.$order->id, ['status' => 'cancelled', 'reason' => 'Client request'])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled');
});

it('rejects cancelling a paid order', function (): void {
    $order = Order::factory()->paid()->create();

    $this->actingAs(admin());

    $this->patchJson('/v1/admin/orders/'.$order->id, ['status' => 'cancelled', 'reason' => 'nope'])
        ->assertStatus(422);
});

it('adds an adjustment to an unpaid order', function (): void {
    $order = Order::factory()->placed()->create();

    $this->actingAs(admin());

    $this->postJson('/v1/admin/orders/'.$order->id.'/adjustments', [
        'type' => 'shipping',
        'amount' => 1500,
        'label' => 'Express shipping',
    ])->assertOk()
        ->assertJsonCount(1, 'data.adjustments');

    expect($order->adjustments()->count())->toBe(1);
});

it('rejects adjusting a paid order', function (): void {
    $order = Order::factory()->paid()->create();

    $this->actingAs(admin());

    $this->postJson('/v1/admin/orders/'.$order->id.'/adjustments', [
        'type' => 'discount',
        'amount' => 500,
        'label' => 'Late discount',
    ])->assertStatus(422);
});
