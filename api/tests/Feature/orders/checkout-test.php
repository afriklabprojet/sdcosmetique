<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Cart;

it('rejects skipped checkout steps and places a guest order', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 100,
        'sale_price' => null,
        'stock' => 5,
    ]);
    $method = Method::factory()->create(['amount' => 20, 'cost' => 10]);

    $this->getJson('/v1/cart')->assertOk();
    $this->postJson('/v1/cart-items', [
        'product' => $child->slug,
        'quantity' => 1,
    ])->assertCreated();

    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertUnprocessable();

    $this->putJson('/v1/checkout/contact', [
        'email' => 'guest@example.com',
    ])->assertOk()->assertJsonPath('data.step', 'delivery');

    $this->putJson('/v1/checkout/delivery', [
        'delivery_method_id' => $method->id,
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
        'phone' => '+22501020304',
    ])->assertOk()->assertJsonPath('data.step', 'payment');

    $this->getJson('/v1/checkout/review')->assertUnprocessable();

    $this->putJson('/v1/checkout/payment', [
        'gateway' => 'null',
    ])->assertOk()->assertJsonPath('data.step', 'review');

    $this->getJson('/v1/checkout')->assertOk()->assertJsonPath('data.step', 'review');

    $this->postJson('/v1/orders')
        ->assertCreated()
        ->assertJsonPath('data.status', 'placed')
        ->assertJsonPath('data.email', 'g***t@example.com')
        ->assertJsonPath('data.total', 120);

    expect(Cart::query()->whereNotNull('guest_token')->first()?->items()->count())->toBe(0)
        ->and($child->fresh()->stock)->toBe(4);
});

it('masks guest order PII on the public order endpoint', function (): void {
    $order = Order::factory()->placed()->create([
        'client_id' => null,
        'email' => 'fatou.traore@gmail.com',
        'destination' => [
            'first_name' => 'Fatou',
            'last_name' => 'Traore',
            'line_1' => 'Rue des Jardins',
            'city' => 'Abidjan',
            'country' => 'CI',
            'phone' => '+22501020304',
        ],
    ]);

    $this->getJson('/v1/orders/'.$order->reference)
        ->assertOk()
        ->assertJsonPath('data.email', 'f**********e@gmail.com')
        ->assertJsonPath('data.destination.recipient', 'Fatou T.')
        ->assertJsonPath('data.destination.city', 'Abidjan')
        ->assertJsonPath('data.destination.country', 'CI')
        ->assertJsonMissingPath('data.destination.line_1')
        ->assertJsonMissingPath('data.destination.phone');
});

it('reveals full PII to the authenticated order owner', function (): void {
    $client = Client::factory()->create();
    $order = Order::factory()->placed()->create([
        'client_id' => $client->id,
        'email' => 'fatou.traore@gmail.com',
        'destination' => [
            'first_name' => 'Fatou',
            'last_name' => 'Traore',
            'line_1' => 'Rue des Jardins',
            'city' => 'Abidjan',
            'country' => 'CI',
            'phone' => '+22501020304',
        ],
    ]);

    $this->actingAs($client->user);

    $this->getJson('/v1/account/orders/'.$order->reference)
        ->assertOk()
        ->assertJsonPath('data.email', 'fatou.traore@gmail.com')
        ->assertJsonPath('data.destination.line_1', 'Rue des Jardins')
        ->assertJsonPath('data.destination.phone', '+22501020304');
});
