<?php

declare(strict_types=1);

use App\Mail\AccountReadyMail;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

/**
 * Le compte automatique ne doit se créer que lorsqu'une commande est
 * réellement payée (§2) — ces tests placent une vraie commande jusqu'au
 * webhook de paiement, comme payments/webhook-test.php, plutôt que d'appeler
 * ClientLinker directement : c'est le déclenchement bout en bout qui compte.
 */
function placeGuestOrderAndPay(string $email, array $delivery = []): string
{
    Http::fake([
        'https://api.jeko.africa/*' => Http::response([
            'id' => 'jeko-'.uniqid(),
            'redirectUrl' => 'https://pay.jeko.africa/abc',
        ], 200),
    ]);

    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 3,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);

    test()->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    test()->putJson('/v1/checkout/contact', ['email' => $email])->assertOk();
    test()->putJson('/v1/checkout/delivery', array_merge([
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kouassi',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
        'phone' => '0700000000',
    ], $delivery))->assertOk();
    test()->putJson('/v1/checkout/payment', ['gateway' => 'jeko'])->assertOk();
    $placed = test()->postJson('/v1/orders')->assertCreated();
    $reference = $placed->json('data.reference');

    $payment = test()->postJson('/v1/orders/'.$reference.'/payments', ['payment_method' => 'wave'])->assertCreated();
    $attemptReference = $payment->json('data.reference');

    $payload = json_encode(['reference' => $attemptReference, 'status' => 'PAID'], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-jeko-secret');

    test()->call('POST', '/webhooks/jeko', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_JEKO_SIGNATURE' => $signature,
    ], $payload)->assertOk()->assertJsonPath('status', 'settled');

    return $reference;
}

it('creates a client account automatically once a guest order is actually paid', function (): void {
    Mail::fake();

    $reference = placeGuestOrderAndPay('nouvelle.cliente@example.com');

    $order = Order::query()->where('reference', $reference)->first();
    $user = User::query()->where('email', 'nouvelle.cliente@example.com')->first();

    expect($order->client_id)->not->toBeNull()
        ->and($user)->not->toBeNull()
        ->and($user->password)->toBeNull()
        ->and($user->name)->toBe('Awa Kouassi')
        ->and($user->client->id)->toBe($order->client_id)
        ->and($user->client->phone)->toBe('0700000000');

    Mail::assertSent(AccountReadyMail::class, fn (AccountReadyMail $mail): bool => $mail->user->is($user));
});

it('does not create any account when the cart is only started, never paid', function (): void {
    Mail::fake();

    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create(['regular_price' => 100, 'sale_price' => null, 'stock' => 3]);

    $this->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    $this->putJson('/v1/checkout/contact', ['email' => 'abandonne@example.com'])->assertOk();

    expect(User::query()->where('email', 'abandonne@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();
});

it('does not create an account when the payment fails', function (): void {
    Mail::fake();

    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create(['regular_price' => 100, 'sale_price' => null, 'stock' => 3]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);

    $this->postJson('/v1/cart-items', ['product' => $child->slug, 'quantity' => 1])->assertCreated();
    $this->putJson('/v1/checkout/contact', ['email' => 'echec@example.com'])->assertOk();
    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa', 'last_name' => 'Kouassi',
        'line_1' => 'Cocody', 'city' => 'Abidjan', 'country' => 'CI',
    ])->assertOk();
    $this->putJson('/v1/checkout/payment', ['gateway' => 'jeko'])->assertOk();
    $placed = $this->postJson('/v1/orders')->assertCreated();
    $reference = $placed->json('data.reference');

    $payment = $this->postJson('/v1/orders/'.$reference.'/payments', ['payment_method' => 'wave'])->assertCreated();
    $attemptReference = $payment->json('data.reference');

    $payload = json_encode(['reference' => $attemptReference, 'status' => 'ERROR'], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-jeko-secret');

    $this->call('POST', '/webhooks/jeko', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_ACCEPT' => 'application/json',
        'HTTP_JEKO_SIGNATURE' => $signature,
    ], $payload)->assertOk()->assertJsonPath('status', 'recorded');

    expect(User::query()->where('email', 'echec@example.com')->exists())->toBeFalse();
    Mail::assertNothingSent();

    $order = Order::query()->where('reference', $reference)->first();
    expect($order->client_id)->toBeNull()->and($order->paid_at)->toBeNull();
});

it('attaches a new order to an existing client instead of creating a duplicate', function (): void {
    Mail::fake();

    $existingUser = User::factory()->create(['email' => 'fidele@example.com', 'name' => 'Client Fidèle']);
    $existingClient = Client::factory()->for($existingUser)->create(['phone' => '0711111111']);

    $reference = placeGuestOrderAndPay('fidele@example.com');

    $order = Order::query()->where('reference', $reference)->first();

    expect($order->client_id)->toBe($existingClient->id)
        ->and(User::query()->where('email', 'fidele@example.com')->count())->toBe(1)
        ->and($existingUser->fresh()->name)->toBe('Client Fidèle') // pas écrasé
        ->and($existingClient->fresh()->phone)->toBe('0711111111'); // pas écrasé non plus

    Mail::assertNothingSent(); // pas de mail "bienvenue" pour un compte déjà existant
});

it('links a new order to an existing client even when that client had no phone yet', function (): void {
    $existingUser = User::factory()->create(['email' => 'sansphone@example.com']);
    Client::factory()->for($existingUser)->create(['phone' => null]);

    placeGuestOrderAndPay('sansphone@example.com', ['phone' => '0799999999']);

    expect($existingUser->fresh()->client->phone)->toBe('0799999999');
});

it('normalizes email case when matching an existing client', function (): void {
    $existingUser = User::factory()->create(['email' => 'majuscule@example.com']);
    $existingClient = Client::factory()->for($existingUser)->create();

    $reference = placeGuestOrderAndPay('MAJUSCULE@Example.com');

    $order = Order::query()->where('reference', $reference)->first();

    expect($order->client_id)->toBe($existingClient->id)
        ->and(User::query()->count())->toBe(1);
});

it('groups several orders placed with the same e-mail under one client with full history', function (): void {
    Mail::fake();

    $firstReference = placeGuestOrderAndPay('recurrente@example.com');
    $secondReference = placeGuestOrderAndPay('recurrente@example.com');

    $user = User::query()->where('email', 'recurrente@example.com')->firstOrFail();

    expect(User::query()->where('email', 'recurrente@example.com')->count())->toBe(1);

    $response = $this->actingAs($user)->getJson('/v1/account/orders')->assertOk();
    $references = collect($response->json('data'))->pluck('reference');

    expect($references)->toContain($firstReference)
        ->and($references)->toContain($secondReference)
        ->and($references)->toHaveCount(2);
});

it('does not relink an order whose client is already set', function (): void {
    $client = Client::factory()->create();

    $order = Order::factory()->placed()->create([
        'client_id' => $client->id,
        'email' => 'autre@example.com',
    ]);

    $order->linker()->attach();

    expect($order->fresh()->client_id)->toBe($client->id)
        ->and(User::query()->where('email', 'autre@example.com')->exists())->toBeFalse();
});
