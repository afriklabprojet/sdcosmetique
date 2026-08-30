<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Delivery\Method;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Cart;

it('merges guest lines into the client cart and sums colliding products', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 10,
        'sale_price' => null,
        'stock' => 10,
    ]);

    $guest = Cart::factory()->create();
    $guest->add($child, 2);

    $client = Cart::factory()->create(['guest_token' => null, 'client_id' => Client::factory()]);
    $client->add($child, 1);

    $client->merge($guest);

    expect($client->items()->count())->toBe(1)
        ->and($client->items()->first()->quantity)->toBe(3)
        ->and(Cart::query()->find($guest->id))->toBeNull();
});

it('re-points an in-flight guest draft onto the client cart during merge', function (): void {
    $parent = Product::factory()->parentProduct()->create();
    $child = Product::factory()->child($parent)->create([
        'regular_price' => 10,
        'sale_price' => null,
        'stock' => 10,
    ]);
    $method = Method::factory()->create();

    $guest = Cart::factory()->create();
    $guest->add($child, 1);

    $draft = Order::factory()->draft()->create([
        'cart_id' => $guest->id,
        'client_id' => null,
        'email' => 'guest@example.com',
        'delivery_method_id' => $method->id,
        'gateway' => 'null',
        'destination' => [
            'first_name' => 'Awa',
            'last_name' => 'Kone',
            'line_1' => 'Cocody',
            'city' => 'Abidjan',
            'country' => 'CI',
        ],
    ]);

    $owner = Client::factory()->create();
    $clientCart = Cart::factory()->create(['guest_token' => null, 'client_id' => $owner->id]);

    $clientCart->merge($guest);

    $draft->refresh();

    expect($draft->cart_id)->toBe($clientCart->id)
        ->and($draft->client_id)->toBe($owner->id)
        ->and($draft->email)->toBe('guest@example.com')
        ->and($draft->placed_at)->toBeNull()
        ->and(Cart::query()->find($guest->id))->toBeNull();
});
