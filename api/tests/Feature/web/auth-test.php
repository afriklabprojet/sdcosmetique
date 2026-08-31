<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;

it('merges the guest cart into the client cart on login', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 25,
        'sale_price' => null,
        'stock' => 8,
    ]);
    $client = Client::factory()->create();

    $this->postJson('/api/cart-items', [
        'product' => $child->slug,
        'quantity' => 2,
    ])->assertCreated();

    $this->postJson('/login', [
        'email' => $client->user->email,
        'password' => 'password',
    ])->assertSuccessful();

    $this->getJson('/api/cart')
        ->assertOk()
        ->assertJsonPath('data.items.0.quantity', 2)
        ->assertJsonPath('data.total', 50);
});

it('keeps the checkout draft alive when a guest logs in mid-checkout', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 25,
        'sale_price' => null,
        'stock' => 8,
    ]);
    $method = Method::factory()->create(['amount' => 0, 'cost' => 0]);
    $client = Client::factory()->create();

    $this->postJson('/api/cart-items', [
        'product' => $child->slug,
        'quantity' => 1,
    ])->assertCreated();

    $this->putJson('/api/checkout/contact', [
        'email' => 'guest-mid-checkout@example.com',
    ])->assertOk();

    $this->putJson('/api/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertOk()->assertJsonPath('data.step', 'payment');

    $draftReference = $this->getJson('/api/checkout')->assertOk()->json('data.reference');

    $this->postJson('/login', [
        'email' => $client->user->email,
        'password' => 'password',
    ])->assertSuccessful();

    $this->getJson('/api/checkout')
        ->assertOk()
        ->assertJsonPath('data.reference', $draftReference)
        ->assertJsonPath('data.step', 'payment')
        ->assertJsonPath('data.email', 'guest-mid-checkout@example.com');

    $draft = Order::query()->where('reference', $draftReference)->firstOrFail();

    expect($draft->client_id)->toBe($client->id)
        ->and($draft->cart_id)->not->toBeNull()
        ->and($draft->placed_at)->toBeNull();
});

it('logs out through Fortify JSON', function (): void {
    $user = User::factory()->create();

    $this->postJson('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSuccessful();

    $this->postJson('/logout')->assertSuccessful();
    $this->getJson('/api/session')
        ->assertOk()
        ->assertJsonPath('user', null);
});

it('returns JSON from login and register even without Accept: application/json', function (): void {
    $user = User::factory()->create();

    $this->withHeaders([
        'Accept' => '*/*',
        'Origin' => 'http://localhost:3000',
    ])->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk()->assertJson(['two_factor' => false]);

    $this->postJson('/logout')->assertSuccessful();

    $this->withHeaders([
        'Accept' => '*/*',
        'Origin' => 'http://localhost:3000',
    ])->post('/register', [
        'name' => 'Awa Kone',
        'email' => 'awa.json@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'terms' => true,
    ])->assertCreated();
});
