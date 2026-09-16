<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Pos\Models\AuditLog;
use App\Modules\Pos\Models\CashRegister;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;

function fakeJekoPaymentRequest(string $requestId = 'jeko-req-1', string $redirectUrl = 'https://pay.jeko.africa/abc'): void
{
    Http::fake([
        'https://api.jeko.africa/partner_api/payment_requests' => Http::response([
            'id' => $requestId,
            'redirectUrl' => $redirectUrl,
        ], 200),
    ]);
}

function jekoWebhook(string $reference, string $status = 'PAID'): TestResponse
{
    $payload = json_encode(['reference' => $reference, 'status' => $status], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-jeko-secret');

    return test()->call('POST', '/webhooks/jeko', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_JEKO_SIGNATURE' => $signature,
    ], $payload);
}

it('creates a sale awaiting Jeko payment — placed but not paid, exposing a redirect link and QR', function (): void {
    fakeJekoPaymentRequest();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'orange_money',
        'idempotency_key' => 'jeko-sale-1',
    ])->assertCreated();

    expect($sale->json('data.status'))->toBe('placed')
        ->and($sale->json('data.tenders.0.pending'))->toBeTrue()
        ->and($sale->json('data.tenders.0.redirect_url'))->toBe('https://pay.jeko.africa/abc')
        ->and($sale->json('data.tenders.0.qr_image'))->toStartWith('data:image/png;base64,');

    $orderId = $sale->json('data.id');
    $sessionState = $this->postJson('/v1/admin/pos/sessions/'.$session['id'].'/close', ['actual_cash' => 0])->assertOk();
    expect($sessionState->json('data.totals_by_method.jeko'))->toBe(0);

    expect(Order::find($orderId)->paid_at)->toBeNull();
});

it('confirms the sale once the Jeko webhook settles the pending attempt', function (): void {
    fakeJekoPaymentRequest();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'email' => 'jeko.client@example.com',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'wave',
        'idempotency_key' => 'jeko-sale-2',
    ])->assertCreated();

    $orderId = $sale->json('data.id');
    $reference = Attempt::where('gateway', 'jeko')->latest('id')->first()->reference;

    jekoWebhook($reference)->assertOk();

    $order = Order::find($orderId);
    expect($order->paid_at)->not->toBeNull()
        ->and($order->client_id)->not->toBeNull();

    $receipt = $this->actingAs($admin)->getJson("/v1/admin/pos/sales/{$orderId}/receipt")->assertOk();
    expect($receipt->json('data.status'))->toBe('paid');
});

it('only pays the order once every tender is confirmed — cash immediately, Jeko only after its webhook', function (): void {
    fakeJekoPaymentRequest();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [
            ['method' => 'cash', 'amount' => 4_000],
            ['method' => 'jeko', 'amount' => 6_000],
        ],
        'payment_method' => 'mtn_momo',
        'idempotency_key' => 'jeko-split-1',
    ])->assertCreated();

    $orderId = $sale->json('data.id');

    // Espèces confirmées, Jeko en attente — la vente ne doit pas encore être payée.
    expect(Order::find($orderId)->paid_at)->toBeNull();

    $reference = Attempt::where('gateway', 'jeko')->latest('id')->first()->reference;
    jekoWebhook($reference)->assertOk();

    expect(Order::find($orderId)->paid_at)->not->toBeNull();
});

it('rolls back the whole sale, restoring stock, when Jeko fails to initiate the payment', function (): void {
    Http::fake([
        'https://api.jeko.africa/partner_api/payment_requests' => Http::response(['message' => 'Service unavailable'], 500),
    ]);
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'orange_money',
        'idempotency_key' => 'jeko-fail-1',
    ])->assertStatus(422);

    expect($product->refresh()->stock)->toBe(5)
        ->and(Order::where('idempotency_key', 'jeko-fail-1')->exists())->toBeFalse();
});

it('lets the cashier cancel a sale still awaiting Jeko payment, restoring stock', function (): void {
    fakeJekoPaymentRequest();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'orange_money',
        'idempotency_key' => 'jeko-cancel-1',
    ])->assertCreated();

    expect($product->refresh()->stock)->toBe(4);

    $orderId = $sale->json('data.id');
    $this->actingAs($admin)->deleteJson("/v1/admin/pos/sales/{$orderId}")->assertOk();

    $order = Order::find($orderId);
    expect($order->cancelled_at)->not->toBeNull()
        ->and($product->refresh()->stock)->toBe(5)
        ->and(AuditLog::query()
            ->where('action', AuditLog::SALE_CANCELLED)
            ->where('auditable_id', $orderId)
            ->where('user_id', $admin->id)
            ->exists())->toBeTrue();

    $this->actingAs($admin)->deleteJson("/v1/admin/pos/sales/{$orderId}")->assertStatus(422);
});

it('forbids a cashier from cancelling another cashier’s pending sale', function (): void {
    fakeJekoPaymentRequest();
    $owner = admin(['role' => 'cashier', 'root_at' => null]);
    $ownerSession = test()->actingAs($owner)
        ->postJson('/v1/admin/pos/sessions/open', [
            'cash_register_id' => CashRegister::factory()->create()->id,
            'opening_balance' => 0,
        ])->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($owner)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $ownerSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'orange_money',
        'idempotency_key' => 'cross-cashier-cancel',
    ])->assertCreated();

    $intruder = admin(['role' => 'cashier', 'root_at' => null]);

    $this->actingAs($intruder)
        ->deleteJson('/v1/admin/pos/sales/'.$sale->json('data.id'))
        ->assertForbidden();

    expect(Order::find($sale->json('data.id'))->cancelled_at)->toBeNull()
        ->and($product->refresh()->stock)->toBe(4);
});

it('does not let a previously failed attempt block settlement once a new attempt on the same payment confirms', function (): void {
    fakeJekoPaymentRequest();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', ['cash_register_id' => $register->id, 'opening_balance' => 0])
        ->assertCreated()->json('data');
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'jeko', 'amount' => 5_000]],
        'payment_method' => 'orange_money',
        'idempotency_key' => 'jeko-retry-1',
    ])->assertCreated();

    $attempt = Attempt::where('gateway', 'jeko')->latest('id')->first();
    $attempt->fail('Simulated stale failure.');

    // Un second essai (même paiement) est créé et confirmé directement (simule une nouvelle tentative).
    $secondAttempt = $attempt->payment->attempts()->create([
        'gateway' => 'jeko',
        'reference' => 'POS-'.Str::upper(Str::random(10)),
        'amount' => 5_000,
        'currency' => 'XOF',
        'initiated_at' => now(),
    ]);

    jekoWebhook($secondAttempt->reference)->assertOk();

    expect(Order::find($sale->json('data.id'))->paid_at)->not->toBeNull();
});
