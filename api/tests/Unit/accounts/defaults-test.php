<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Address;
use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;

it('resolves client address defaults via defaults domain noun', function (): void {
    $client = Client::factory()->create();
    $address1 = Address::factory()->create(['client_id' => $client->id]);
    $address2 = Address::factory()->create(['client_id' => $client->id]);

    expect($client->defaults()->shipping())->toBeNull()
        ->and($client->defaults()->billing())->toBeNull();

    $client->forceFill([
        'shipping_id' => $address1->id,
        'billing_id' => $address2->id,
    ])->save();

    expect($client->defaults()->shipping()?->id)->toBe($address1->id)
        ->and($client->defaults()->billing()?->id)->toBe($address2->id);
});

it('computes client lifetime value via single-word value affordance', function (): void {
    $client = Client::factory()->create();

    Order::factory()->create([
        'client_id' => $client->id,
        'placed_at' => now(),
        'paid_at' => now(),
        'subtotal' => 500,
        'total' => 500,
    ]);

    expect($client->value()->value)->toBe(500);
});
