<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Pos\Models\CashRegister;

function completePosSale(User $admin, CashRegister $register, int $amount, string $idempotencyKey): void
{
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()
        ->json('data');

    $product = Product::factory()->child()->create(['regular_price' => $amount, 'sale_price' => null, 'stock' => 10]);

    test()->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => $amount]],
        'idempotency_key' => $idempotencyKey,
    ])->assertCreated();
}

it('reports today/week/month/all-time totals for the sales widgets', function (): void {
    $admin = admin();

    completePosSale($admin, CashRegister::factory()->create(), 5_000, 'summary-sale-1');
    completePosSale($admin, CashRegister::factory()->create(), 7_000, 'summary-sale-2');

    $response = $this->actingAs($admin)->getJson('/v1/admin/pos/reports/summary')->assertOk();

    expect($response->json('data.today.sales_count'))->toBe(2)
        ->and($response->json('data.today.revenue'))->toBe(12_000)
        ->and($response->json('data.week.sales_count'))->toBe(2)
        ->and($response->json('data.month.sales_count'))->toBe(2)
        ->and($response->json('data.all_time.sales_count'))->toBe(2)
        ->and($response->json('data.all_time.revenue'))->toBe(12_000);
});

it('exports the sales history as a downloadable PDF', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    completePosSale($admin, $register, 6_000, 'export-pdf-sale');

    $this->actingAs($admin)
        ->get('/v1/admin/pos/sales/export/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

it('exports the sales history as a CSV file readable in Excel', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    completePosSale($admin, $register, 6_000, 'export-csv-sale');

    $response = $this->actingAs($admin)
        ->get('/v1/admin/pos/sales/export/csv')
        ->assertOk();

    expect($response->headers->get('content-type'))->toContain('text/csv');

    $body = $response->streamedContent();

    expect($body)->toContain('Référence')
        ->and($body)->toContain('6000');
});
