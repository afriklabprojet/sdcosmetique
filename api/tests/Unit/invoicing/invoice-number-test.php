<?php

declare(strict_types=1);

use App\Modules\Invoicing\Domain\InvoicePdfBuilder;
use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Models\Order;

it('assigns a sequential SDC-YYYY-NNNNNN number on first access', function (): void {
    $order = Order::factory()->paid()->create();

    $invoice = Invoice::forOrder($order);

    expect($invoice->number)->toMatch('/^SDC-'.now()->year.'-\d{6}$/');
});

it('never assigns two different numbers to the same order', function (): void {
    $order = Order::factory()->paid()->create();

    $first = Invoice::forOrder($order);
    $second = Invoice::forOrder($order);

    expect($first->id)->toBe($second->id)
        ->and($first->number)->toBe($second->number)
        ->and(Invoice::query()->where('order_id', $order->id)->count())->toBe(1);
});

it('never reuses a number across two different orders', function (): void {
    $orderA = Order::factory()->paid()->create();
    $orderB = Order::factory()->paid()->create();

    $invoiceA = Invoice::forOrder($orderA);
    $invoiceB = Invoice::forOrder($orderB);

    expect($invoiceA->number)->not->toBe($invoiceB->number)
        ->and(Invoice::query()->distinct('number')->count('number'))->toBe(2);
});

it('formats amounts as "15 000 FCFA", never "15000FCFA"', function (): void {
    expect(InvoicePdfBuilder::formatMoney(15000))
        ->toBe("15\u{00A0}000 FCFA")
        ->and(InvoicePdfBuilder::formatMoney(125000))
        ->toBe("125\u{00A0}000 FCFA")
        ->and(InvoicePdfBuilder::formatMoney(0))
        ->toBe('0 FCFA');
});
