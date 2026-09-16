<?php

declare(strict_types=1);

use App\Mail\AccountReadyMail;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Pos\Models\CashRegister;
use Illuminate\Support\Facades\Mail;

function openPosSession(User $admin, CashRegister $register, int $openingBalance = 20_000): array
{
    $response = test()->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', [
            'cash_register_id' => $register->id,
            'opening_balance' => $openingBalance,
        ])->assertCreated();

    return $response->json('data');
}

it('blocks non-admin users from the POS routes', function (): void {
    $this->postJson('/v1/admin/pos/sessions/open', [])->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->postJson('/v1/admin/pos/sessions/open', [])->assertForbidden();
});

it('opens a cash register session', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();

    $session = openPosSession($admin, $register, 15_000);

    expect($session['status'])->toBe('open')
        ->and($session['opening_balance'])->toBe(15_000)
        ->and($session['cash_register_id'])->toBe($register->id);
});

it('refuses to open a second session on an already-open register', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();

    openPosSession($admin, $register);

    $this->actingAs($admin)
        ->postJson('/v1/admin/pos/sessions/open', [
            'cash_register_id' => $register->id,
            'opening_balance' => 10_000,
        ])->assertStatus(422);
});

it('creates a POS sale, decrements stock and confirms payment', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);

    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $response = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'customer_name' => 'Client de passage',
        'items' => [
            ['product_id' => $product->id, 'quantity' => 2],
        ],
        'tenders' => [
            ['method' => 'cash', 'amount' => 10_000],
        ],
        'idempotency_key' => 'sale-key-1',
    ])->assertCreated();

    expect($response->json('data.reference'))->toStartWith('CMD-'.now()->year.'-')
        ->and($response->json('data.total'))->toBe(10_000)
        ->and($response->json('data.status'))->toBe('paid')
        ->and($response->json('data.tenders.0.method'))->toBe('cash')
        ->and($response->json('data.tenders.0.amount'))->toBe(10_000);

    expect($product->refresh()->stock)->toBe(8);
});

it('refuses a sale when stock is insufficient', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);

    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 1]);

    $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [
            ['product_id' => $product->id, 'quantity' => 5],
        ],
        'tenders' => [
            ['method' => 'cash', 'amount' => 25_000],
        ],
        'idempotency_key' => 'sale-key-insufficient',
    ])->assertStatus(422);

    expect($product->refresh()->stock)->toBe(1);
});

it('enforces the discount ceiling for a cashier but allows a manager the same discount', function (): void {
    $register = CashRegister::factory()->create();

    $cashier = admin(['role' => 'cashier', 'root_at' => null]);
    $cashierSession = openPosSession($cashier, $register);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 20]);

    // 20% > plafond vendeur (10%) — refusé.
    $this->actingAs($cashier)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $cashierSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'discount' => ['type' => 'percent', 'value' => 20],
        'tenders' => [['method' => 'cash', 'amount' => 8_000]],
        'idempotency_key' => 'discount-cashier',
    ])->assertStatus(422);

    $this->postJson('/v1/admin/pos/sessions/'.$cashierSession['id'].'/close', ['actual_cash' => 20_000])->assertOk();

    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $managerRegister = CashRegister::factory()->create();
    $managerSession = openPosSession($manager, $managerRegister);

    // Même remise de 20 %, autorisée pour un manager (plafond 30 %).
    $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $managerSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'discount' => ['type' => 'percent', 'value' => 20],
        'tenders' => [['method' => 'cash', 'amount' => 8_000]],
        'idempotency_key' => 'discount-manager',
    ])->assertCreated()
        ->assertJsonPath('data.total', 8_000);
});

it('accepts a split payment across multiple tenders', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 5]);

    $response = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [
            ['method' => 'cash', 'amount' => 4_000],
            ['method' => 'wave', 'amount' => 6_000],
        ],
        'idempotency_key' => 'split-payment',
    ])->assertCreated();

    expect($response->json('data.tenders'))->toHaveCount(2)
        ->and($response->json('data.status'))->toBe('paid');
});

it('refuses a sale when the tenders do not sum to the total', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 5]);

    $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'mismatch-payment',
    ])->assertStatus(422);

    expect($product->refresh()->stock)->toBe(5);
});

it('is idempotent — replaying the same key returns the original sale, never a duplicate', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $payload = [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'replayed-key',
    ];

    $first = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', $payload)->assertCreated();
    $second = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', $payload)->assertCreated();

    expect($first->json('data.reference'))->toBe($second->json('data.reference'))
        ->and($product->refresh()->stock)->toBe(9);
});

it('never replays an idempotency key across cashier sessions', function (): void {
    $owner = admin(['role' => 'cashier', 'root_at' => null]);
    $ownerSession = openPosSession($owner, CashRegister::factory()->create());
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $this->actingAs($owner)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $ownerSession['id'],
        'customer_name' => 'Cliente privée',
        'customer_phone' => '0701020304',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'private-owner-key',
    ])->assertCreated();

    $intruder = admin(['role' => 'cashier', 'root_at' => null]);
    $intruderSession = openPosSession($intruder, CashRegister::factory()->create());

    $this->actingAs($intruder)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $intruderSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'private-owner-key',
    ])->assertStatus(422)
        ->assertJsonMissing(['phone' => '0701020304']);

    expect($product->refresh()->stock)->toBe(9);
});

it('lets a manager refund a sale and restores stock, but forbids a cashier', function (): void {
    $register = CashRegister::factory()->create();
    $cashier = admin(['role' => 'cashier', 'root_at' => null]);
    $session = openPosSession($cashier, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($cashier)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 3]],
        'tenders' => [['method' => 'cash', 'amount' => 15_000]],
        'idempotency_key' => 'refund-me',
    ])->assertCreated();

    $orderId = $sale->json('data.id');
    expect($product->refresh()->stock)->toBe(7);

    $this->actingAs($cashier)
        ->postJson("/v1/admin/pos/sales/{$orderId}/refund", ['reason' => 'Client insatisfait', 'method' => 'cash'])
        ->assertForbidden();

    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $refund = $this->actingAs($manager)
        ->postJson("/v1/admin/pos/sales/{$orderId}/refund", ['reason' => 'Client insatisfait', 'method' => 'cash'])
        ->assertOk();

    expect($refund->json('data.refunded_at'))->not->toBeNull()
        ->and($refund->json('data.refund_status'))->toBe('full')
        ->and($refund->json('data.refunded_amount'))->toBe(15_000);

    expect($product->refresh()->stock)->toBe(10);
});

it('refunds only a chosen line and quantity, restores only that stock, and marks the sale partially refunded', function (): void {
    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $session = openPosSession($manager, $register);
    $productA = Product::factory()->child()->create(['regular_price' => 4_000, 'sale_price' => null, 'stock' => 10]);
    $productB = Product::factory()->child()->create(['regular_price' => 6_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [
            ['product_id' => $productA->id, 'quantity' => 2],
            ['product_id' => $productB->id, 'quantity' => 1],
        ],
        'tenders' => [['method' => 'cash', 'amount' => 14_000]],
        'idempotency_key' => 'partial-refund-sale',
    ])->assertCreated();

    $orderItemAId = $sale->json('data.items.0.id');
    $orderId = $sale->json('data.id');

    $refund = $this->actingAs($manager)->postJson("/v1/admin/pos/sales/{$orderId}/refund", [
        'reason' => 'Un seul article rendu',
        'method' => 'cash',
        'items' => [['order_item_id' => $orderItemAId, 'quantity' => 1]],
    ])->assertOk();

    expect($refund->json('data.refund_status'))->toBe('partial')
        ->and($refund->json('data.refunded_amount'))->toBe(4_000)
        ->and($refund->json('data.refunded_at'))->toBeNull()
        ->and($productA->refresh()->stock)->toBe(9)
        ->and($productB->refresh()->stock)->toBe(9);

    // Refuse de rembourser plus que ce qu'il reste sur cette ligne (1 déjà remboursé sur 2).
    $this->actingAs($manager)->postJson("/v1/admin/pos/sales/{$orderId}/refund", [
        'reason' => 'Trop',
        'method' => 'cash',
        'items' => [['order_item_id' => $orderItemAId, 'quantity' => 5]],
    ])->assertStatus(422);
});

it('applies the discount ratio proportionally when refunding a discounted sale', function (): void {
    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $session = openPosSession($manager, $register);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'discount' => ['type' => 'percent', 'value' => 10],
        'tenders' => [['method' => 'cash', 'amount' => 18_000]],
        'idempotency_key' => 'discounted-refund-sale',
    ])->assertCreated();

    $orderItemId = $sale->json('data.items.0.id');
    $orderId = $sale->json('data.id');

    // Remise de 10 % appliquée à la commande -> une unité (10 000 bruts) se rembourse à 9 000.
    $refund = $this->actingAs($manager)->postJson("/v1/admin/pos/sales/{$orderId}/refund", [
        'reason' => 'Une unité rendue',
        'method' => 'cash',
        'items' => [['order_item_id' => $orderItemId, 'quantity' => 1]],
    ])->assertOk();

    expect($refund->json('data.refunded_amount'))->toBe(9_000);
});

it('nets a same-session cash refund out of the expected cash at close, but leaves other methods untouched', function (): void {
    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $session = openPosSession($manager, $register, 20_000);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 10_000]],
        'idempotency_key' => 'cash-refund-close-sale',
    ])->assertCreated();

    $this->actingAs($manager)->postJson('/v1/admin/pos/sales/'.$sale->json('data.id').'/refund', [
        'reason' => 'Remboursé en espèces',
        'method' => 'cash',
    ])->assertOk();

    // 20 000 (fond) + 10 000 (vente espèces) − 10 000 (remboursement espèces) = 20 000.
    $response = $this->postJson('/v1/admin/pos/sessions/'.$session['id'].'/close', ['actual_cash' => 20_000])->assertOk();

    expect($response->json('data.expected_cash'))->toBe(20_000)
        ->and($response->json('data.difference'))->toBe(0)
        ->and($response->json('data.totals_by_method.cash'))->toBe(0);
});

it('closes a session and computes expected cash from confirmed cash tenders only', function (): void {
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register, 20_000);
    $product = Product::factory()->child()->create(['regular_price' => 10_000, 'sale_price' => null, 'stock' => 10]);

    $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [
            ['method' => 'cash', 'amount' => 4_000],
            ['method' => 'wave', 'amount' => 6_000],
        ],
        'idempotency_key' => 'close-session-sale',
    ])->assertCreated();

    // Espèces attendues = fond initial (20 000) + règlements espèces (4 000) — le Wave n'entre pas dans le tiroir.
    $response = $this->postJson('/v1/admin/pos/sessions/'.$session['id'].'/close', [
        'actual_cash' => 24_000,
    ])->assertOk();

    expect($response->json('data.expected_cash'))->toBe(24_000)
        ->and($response->json('data.actual_cash'))->toBe(24_000)
        ->and($response->json('data.difference'))->toBe(0)
        ->and($response->json('data.totals_by_method.cash'))->toBe(4_000)
        ->and($response->json('data.totals_by_method.wave'))->toBe(6_000);
});

it('finds a product by its parent title, not just the variant row title', function (): void {
    $admin = admin();
    $parent = Product::factory()->parentProduct()->create(['title' => 'Sérum Éclat Intense']);
    $child = Product::factory()->child($parent)->create(['title' => 'variante interne sans intérêt', 'regular_price' => 9_000, 'sale_price' => null]);

    $response = $this->actingAs($admin)
        ->getJson('/v1/admin/pos/products?q=Intense')
        ->assertOk();

    expect(collect($response->json('data'))->pluck('id'))->toContain($child->id)
        ->and($response->json('data.0.title'))->toBe('Sérum Éclat Intense');
});

it('finds a product by its SKU used as scannable barcode', function (): void {
    $admin = admin();
    $product = Product::factory()->child()->create(['sku' => 'SDC-SERUM-50', 'regular_price' => 12_000, 'sale_price' => null, 'stock' => 4]);

    $this->actingAs($admin)
        ->getJson('/v1/admin/pos/products/barcode/SDC-SERUM-50')
        ->assertOk()
        ->assertJsonPath('data.id', $product->id)
        ->assertJsonPath('data.stock', 4);

    $this->actingAs($admin)
        ->getJson('/v1/admin/pos/products/barcode/UNKNOWN-CODE')
        ->assertNotFound();
});

it('creates a client account automatically for a walk-in customer who gives an e-mail at the till', function (): void {
    Mail::fake();
    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'email' => 'nouvelle.cliente.caisse@example.com',
        'customer_name' => 'Aya Koffi',
        'customer_phone' => '0701020304',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'pos-new-account',
    ])->assertCreated();

    $user = User::query()->where('email', 'nouvelle.cliente.caisse@example.com')->first();

    expect($sale->json('data.customer.client_id'))->not->toBeNull()
        ->and($user)->not->toBeNull()
        ->and($user->name)->toBe('Aya Koffi')
        ->and($user->client->phone)->toBe('0701020304');

    Mail::assertSent(AccountReadyMail::class, fn (AccountReadyMail $mail): bool => $mail->user->is($user));
});

it('attaches a POS sale to an existing client account by e-mail instead of duplicating it', function (): void {
    Mail::fake();
    $existingUser = User::factory()->create(['email' => 'cliente.fidele.caisse@example.com', 'name' => 'Cliente Fidèle']);
    $existingClient = Client::factory()->for($existingUser)->create(['phone' => '0788888888']);

    $admin = admin();
    $register = CashRegister::factory()->create();
    $session = openPosSession($admin, $register);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 10]);

    $sale = $this->actingAs($admin)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $session['id'],
        'email' => 'cliente.fidele.caisse@example.com',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'pos-existing-account',
    ])->assertCreated();

    expect($sale->json('data.customer.client_id'))->toBe($existingClient->id)
        ->and(User::query()->where('email', 'cliente.fidele.caisse@example.com')->count())->toBe(1);

    Mail::assertNotSent(AccountReadyMail::class);
});

it('forbids a cashier from selling into or closing another cashier\'s open session (VULN-02)', function (): void {
    $ownerCashier = admin(['role' => 'cashier', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $ownerSession = openPosSession($ownerCashier, $register);

    $intruder = admin(['role' => 'cashier', 'root_at' => null]);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $this->actingAs($intruder)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $ownerSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'cross-cashier-sale',
    ])->assertForbidden();

    $this->actingAs($intruder)
        ->postJson('/v1/admin/pos/sessions/'.$ownerSession['id'].'/close', ['actual_cash' => 20_000])
        ->assertForbidden();

    expect($product->refresh()->stock)->toBe(5);
});

it('lets a manager sell into or close a cashier\'s session (privileged override)', function (): void {
    $ownerCashier = admin(['role' => 'cashier', 'root_at' => null]);
    $register = CashRegister::factory()->create();
    $ownerSession = openPosSession($ownerCashier, $register);

    $manager = admin(['role' => 'manager', 'root_at' => null]);
    $product = Product::factory()->child()->create(['regular_price' => 5_000, 'sale_price' => null, 'stock' => 5]);

    $this->actingAs($manager)->postJson('/v1/admin/pos/sales', [
        'cash_register_session_id' => $ownerSession['id'],
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
        'tenders' => [['method' => 'cash', 'amount' => 5_000]],
        'idempotency_key' => 'manager-override-sale',
    ])->assertCreated();

    $this->actingAs($manager)
        ->postJson('/v1/admin/pos/sessions/'.$ownerSession['id'].'/close', ['actual_cash' => 25_000])
        ->assertOk();
});
