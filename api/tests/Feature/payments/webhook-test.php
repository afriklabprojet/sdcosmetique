<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Support\Facades\Http;

it('settles a placed order through a signed webhook and ignores replay', function (): void {
    Http::fake([
        'https://api-checkout.cinetpay.com/*' => Http::response([
            'code' => '201',
            'message' => 'CREATED',
            'data' => ['payment_url' => 'https://checkout.cinetpay.com/pay/abc'],
        ], 200),
    ]);

    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 3,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);

    $this->getJson('/v1/cart')->assertOk();
    $this->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    $this->putJson('/v1/checkout/contact', ['email' => 'guest@example.com'])->assertOk();
    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertOk();
    $this->putJson('/v1/checkout/payment', ['gateway' => 'cinetpay'])->assertOk();
    $placed = $this->postJson('/v1/orders')->assertCreated();
    $reference = $placed->json('data.reference');

    $payment = $this->postJson('/v1/orders/'.$reference.'/payments')->assertCreated();
    $attemptReference = $payment->json('data.reference');

    $payload = json_encode([
        'reference' => $attemptReference,
        'status' => 'PAID',
    ], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-secret');

    $this->call(
        'POST',
        '/webhooks/cinetpay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk()->assertJsonPath('status', 'settled');

    expect(Attempt::query()->where('reference', $attemptReference)->first()?->confirmed_at)->not->toBeNull()
        ->and(Notification::query()->where('reference', $attemptReference)->first()?->handled_at)->not->toBeNull();

    $this->call(
        'POST',
        '/webhooks/cinetpay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk()->assertJsonPath('status', 'replayed');
});

it('settles a placed order through a null terminal webhook', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 3,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);

    $this->getJson('/v1/cart')->assertOk();
    $this->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    $this->putJson('/v1/checkout/contact', ['email' => 'guest@example.com'])->assertOk();
    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertOk();
    $this->putJson('/v1/checkout/payment', ['gateway' => 'null'])->assertOk();
    $placed = $this->postJson('/v1/orders')->assertCreated();
    $reference = $placed->json('data.reference');

    $payment = $this->postJson('/v1/orders/'.$reference.'/payments')->assertCreated();
    $attemptReference = $payment->json('data.reference');

    $payload = json_encode([
        'reference' => $attemptReference,
        'status' => 'PAID',
    ], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-secret');

    $this->call(
        'POST',
        '/webhooks/null',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk()->assertJsonPath('status', 'settled');

    expect(Attempt::query()->where('reference', $attemptReference)->first()?->confirmed_at)->not->toBeNull()
        ->and(Notification::query()->where('reference', $attemptReference)->first()?->handled_at)->not->toBeNull();
});

it('rejects an unsigned webhook without returning 419', function (): void {
    $payload = json_encode(['reference' => 'MISSING', 'status' => 'PAID'], JSON_THROW_ON_ERROR);

    $this->call(
        'POST',
        '/webhooks/cinetpay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ],
        $payload,
    )->assertStatus(400)->assertJsonPath('status', 'rejected');
});

it('rejects a webhook for an unknown terminal with 404', function (): void {
    $payload = json_encode(['reference' => 'UNKNOWN', 'status' => 'PAID'], JSON_THROW_ON_ERROR);

    $this->call(
        'POST',
        '/webhooks/unknown-terminal',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ],
        $payload,
    )->assertStatus(404)->assertJsonPath('status', 'rejected');
});

it('rolls back a mid-settle failure and returns 422', function (): void {
    $order = Order::factory()->draft()->create([
        'email' => 'guest@example.com',
        'total' => 100,
        'subtotal' => 100,
    ]);
    $payment = Payment::factory()->create([
        'order_id' => $order->id,
        'amount' => 100,
    ]);
    $attempt = Attempt::factory()->create([
        'payment_id' => $payment->id,
        'amount' => 100,
        'reference' => 'DRAFT-SETTLE-1',
    ]);
    $originalPayload = ['reference' => 'DRAFT-SETTLE-1', 'status' => 'PENDING', 'raw' => 'original'];
    $notification = Notification::factory()->create([
        'gateway' => 'cinetpay',
        'reference' => 'DRAFT-SETTLE-1',
        'payment_attempt_id' => $attempt->id,
        'payload' => $originalPayload,
    ]);

    $payload = json_encode([
        'reference' => 'DRAFT-SETTLE-1',
        'status' => 'PAID',
        'raw' => 'signed-retry',
    ], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-secret');

    $this->call(
        'POST',
        '/webhooks/cinetpay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertStatus(422)->assertJsonPath('status', 'failed');

    $notification->refresh();
    $attempt->refresh();
    $payment->refresh();
    $order->refresh();

    expect($attempt->confirmed_at)->toBeNull()
        ->and($payment->paid_at)->toBeNull()
        ->and($order->paid_at)->toBeNull()
        ->and($notification->handled_at)->toBeNull()
        ->and($notification->failure_reason)->toBe('A draft cannot be paid.')
        ->and($notification->payload['raw'])->toBe('signed-retry');
});

it('does not overwrite a handled notification payload on unsigned replay', function (): void {
    $original = ['reference' => 'HANDLED-1', 'status' => 'PAID', 'raw' => 'authentic'];
    Notification::factory()->create([
        'gateway' => 'cinetpay',
        'reference' => 'HANDLED-1',
        'payload' => $original,
        'handled_at' => now(),
    ]);

    $forged = json_encode([
        'reference' => 'HANDLED-1',
        'status' => 'PAID',
        'raw' => 'forged',
    ], JSON_THROW_ON_ERROR);

    $this->call(
        'POST',
        '/webhooks/cinetpay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ],
        $forged,
    )->assertOk()->assertJsonPath('status', 'replayed');

    expect(Notification::query()->where('reference', 'HANDLED-1')->first()?->payload['raw'])->toBe('authentic');
});
