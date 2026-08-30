<?php

declare(strict_types=1);

use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Shared\Money;

it('constructs a settlement from the payment aggregate without Orders importing Payments types', function (): void {
    $order = Order::factory()->placed()->create(['total' => 27000]);
    $payment = Payment::start($order, new Money(27000));
    $attempt = $payment->attempts()->create([
        'gateway' => 'null',
        'reference' => 'ATT-1',
        'amount' => 27000,
        'currency' => 'XOF',
        'initiated_at' => now(),
        'confirmed_at' => now(),
    ]);

    $payment->confirm();
    $settlement = $payment->settlement();

    expect($settlement)->toBeInstanceOf(Settlement::class)
        ->and($settlement->gateway)->toBe('null')
        ->and($settlement->reference)->toBe('ATT-1')
        ->and($settlement->amount)->toBe(27000);

    $order->pay($settlement);

    expect($order->fresh()->paid_at)->not->toBeNull()
        ->and($payment->fresh()->status()->value)->toBe('paid');
});
