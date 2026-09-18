<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Order;
use App\Modules\Pos\Models\CashRegister;
use Illuminate\Support\Facades\URL;

function openReceiptTestSession(User $admin, CashRegister $register, int $openingBalance = 20_000): array
{
    return test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => $openingBalance])
        ->assertCreated()
        ->json('data');
}

it('builds a premium receipt for a POS sale with discount, split payment and cash change', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create(['name' => 'Caisse Cocody']);
    $session = openReceiptTestSession($admin, $register, 20_000);

    $parent = Product::factory()->parentProduct()->create(['title' => 'T-Shirt Premium']);
    $child = Product::factory()->child($parent)->create(['label' => 'Taille : L', 'regular_price' => 10_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'email' => 'client.recu@example.com',
        'customer_name' => 'Aya Koffi',
        'customer_phone' => '0701020304',
        'items' => [['product_id' => $child->id, 'quantity' => 2]],
        'discount' => ['type' => 'fixed', 'value' => 2_000],
        'tenders' => [
            ['method' => 'cash', 'amount' => 10_000, 'received' => 15_000],
            ['method' => 'wave', 'amount' => 8_000],
        ],
        'idempotency_key' => 'receipt-sale-1',
    ])->assertCreated();

    $orderId = $sale->json('data.id');

    $receipt = $this->actingAs($admin)
        ->getJson("/v1/admin/pos/sales/{$orderId}/receipt")
        ->assertOk();

    expect($receipt->json('data.sale_number'))->toBe($sale->json('data.reference'))
        ->and($receipt->json('data.channel'))->toBe('pos')
        ->and($receipt->json('data.cashier.name'))->not->toBeNull()
        ->and($receipt->json('data.register.name'))->toBe('Caisse Cocody')
        ->and($receipt->json('data.customer.name'))->toBe('Aya Koffi')
        ->and($receipt->json('data.items.0.label'))->toBe('Taille : L')
        ->and($receipt->json('data.discount'))->toBe(2_000)
        ->and($receipt->json('data.total'))->toBe(18_000)
        ->and($receipt->json('data.tax'))->toBe(0)
        ->and($receipt->json('data.payments'))->toHaveCount(2)
        ->and($receipt->json('data.change'))->toBe(5_000)
        ->and($receipt->json('data.status'))->toBe('paid')
        ->and($receipt->json('data.qr_image'))->toStartWith('data:image/png;base64,')
        ->and($receipt->json('data.receipt_url'))->toContain('/recu/'.$sale->json('data.reference'));
});

it('shows "Client comptoir" (no customer block) for a walk-in sale without name or e-mail', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openReceiptTestSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'receipt-sale-walkin',
    ])->assertCreated();

    $receipt = $this->actingAs($admin)
        ->getJson('/v1/admin/pos/sales/'.$sale->json('data.id').'/receipt')
        ->assertOk();

    expect($receipt->json('data.customer'))->toBeNull()
        ->and($receipt->json('data.discount'))->toBe(0)
        ->and($receipt->json('data.qr_image'))->toStartWith('data:image/png;base64,')
        ->and($receipt->json('data.receipt_url'))->toContain('/recu/');
});

it('reflects a refund on the receipt status', function (): void {
    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $session = openReceiptTestSession($manager, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'receipt-sale-refund',
    ])->assertCreated();

    $orderId = $sale->json('data.id');
    $this->actingAs($manager)
        ->postJson("/v1/admin/pos/sales/{$orderId}/refund", ['reason' => 'Retour', 'method' => 'cash'])
        ->assertOk();

    $receipt = $this->actingAs($manager)->getJson("/v1/admin/pos/sales/{$orderId}/receipt")->assertOk();

    expect($receipt->json('data.status'))->toBe('refunded');
});

it('streams a PDF receipt in thermal and A4 formats for a POS sale', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openReceiptTestSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'receipt-sale-pdf',
    ])->assertCreated();

    $orderId = $sale->json('data.id');

    foreach (['thermal58', 'thermal80', 'a4'] as $format) {
        $this->actingAs($admin)
            ->get("/v1/admin/pos/sales/{$orderId}/receipt/pdf?format={$format}")
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');
    }
});

it('prevents a cashier from reading another cashier sale or receipt', function (): void {
    $owner = admin(['role' => 'cashier', 'root_at' => null]);
    $intruder = admin(['role' => 'cashier', 'root_at' => null]);
    $session = openReceiptTestSession($owner, CashRegister::factory()->create());
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($owner)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'private-cashier-receipt',
    ])->assertCreated();

    $orderId = $sale->json('data.id');

    $this->actingAs($intruder)->getJson("/v1/admin/pos/sales/{$orderId}")->assertNotFound();
    $this->actingAs($intruder)->getJson("/v1/admin/pos/sales/{$orderId}/receipt")->assertNotFound();
    $this->actingAs($intruder)->get("/v1/admin/pos/sales/{$orderId}/receipt/pdf")->assertNotFound();
});

it('exposes a public receipt only via a validly signed URL — never by guessing the reference', function (): void {
    $order = Order::factory()->paid()->create();

    $this->getJson("/v1/orders/{$order->reference}/receipt")->assertForbidden();
    $this->getJson("/v1/orders/{$order->reference}/receipt?signature=tampered")->assertForbidden();

    $signedShowUrl = URL::signedRoute('orders.receipt.show', ['order' => $order->reference]);
    $response = $this->getJson($signedShowUrl)->assertOk();

    expect($response->json('data.sale_number'))->toBe($order->reference)
        ->and($response->json('data.channel'))->toBe('web')
        ->and($response->json('data.receipt_url'))->toContain('/recu/'.$order->reference)
        ->and($response->json('data.pdf_url'))->toContain('/receipt/pdf');

    $signedPdfUrl = URL::signedRoute('orders.receipt.pdf', ['order' => $order->reference]);
    $this->get($signedPdfUrl)->assertOk()->assertHeader('content-type', 'application/pdf');
});
