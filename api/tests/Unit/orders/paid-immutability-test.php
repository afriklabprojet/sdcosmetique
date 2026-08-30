<?php

declare(strict_types=1);

use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Models\Order;

it('pays a placed order once and then ignores a second settlement', function (): void {
    $order = Order::factory()->placed()->create(['total' => 27000]);

    $order->pay(new Settlement('null', 'REF-1', 27000));
    $paidAt = $order->fresh()->paid_at;
    $order->pay(new Settlement('null', 'REF-1', 27000));

    expect($order->fresh()->paid_at->equalTo($paidAt))->toBeTrue();
});

it('refuses to recalculate a paid order', function (): void {
    $order = Order::factory()->paid()->create();

    $order->recalculate();
})->throws(DomainException::class, 'Paid orders cannot be recalculated.');

it('refuses a settlement that does not match the frozen total', function (): void {
    $order = Order::factory()->placed()->create(['total' => 27000]);

    $order->pay(new Settlement('null', 'REF-2', 1));
})->throws(DomainException::class, 'Settlement amount does not match the order total.');
