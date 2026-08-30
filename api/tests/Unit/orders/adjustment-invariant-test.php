<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Models\Order;
use App\Shared\Money;

it('keeps total equal to subtotal plus add minus subtract', function (): void {
    $order = Order::factory()->create(['subtotal' => 0, 'total' => 0]);
    $order->items()->create([
        'product_id' => Product::factory()->create()->id,
        'title' => 'Line',
        'unit_price' => 100,
        'quantity' => 2,
        'total' => 200,
    ]);

    $order->adjust(AdjustmentType::Shipping, new Money(30), 'Shipping');
    $order->adjust(AdjustmentType::Discount, new Money(20), 'Promo');
    $order->recalculate();

    $added = (int) $order->adjustments()->where('operation', 'add')->sum('amount');
    $subtracted = (int) $order->adjustments()->where('operation', 'subtract')->sum('amount');

    expect($order->total->value)->toBe($order->subtotal->value + $added - $subtracted)
        ->and($order->total->value)->toBe(210);
});

it('refuses to recalculate or adjust a paid order', function (): void {
    $order = Order::factory()->paid()->create();

    $order->adjust(AdjustmentType::Discount, new Money(1), 'Too late');
})->throws(DomainException::class, 'Paid orders cannot be adjusted.');
