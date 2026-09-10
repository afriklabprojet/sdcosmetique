<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;

it('rejects guests and non-admins from the customer list', function (): void {
    Client::factory()->count(2)->create();

    $this->getJson('/v1/admin/customers')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/customers')->assertForbidden();
});

it('lists customers for an admin', function (): void {
    Client::factory()->count(3)->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/customers')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure(['data' => [['id', 'name', 'email', 'phone', 'orders_count', 'total_value']]]);
});

it('shows a single customer for an admin', function (): void {
    $client = Client::factory()->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/customers/'.$client->id)
        ->assertOk()
        ->assertJsonPath('data.id', $client->id)
        ->assertJsonPath('data.email', $client->user->email);
});

it('includes statistics, address, and order dates on the client detail page (§4)', function (): void {
    $client = Client::factory()->create();
    $older = Order::factory()->paid()->for($client)->create(['placed_at' => now()->subDays(10), 'total' => 10000]);
    $newer = Order::factory()->paid()->for($client)->create([
        'placed_at' => now()->subDay(),
        'total' => 20000,
        'destination' => [
            'first_name' => 'Fatou', 'last_name' => 'Bamba',
            'line_1' => 'Riviera 2', 'city' => 'Abidjan', 'country' => 'CI', 'phone' => '+22507000000',
        ],
    ]);

    $this->actingAs(admin());

    $response = $this->getJson('/v1/admin/customers/'.$client->id)->assertOk();

    expect($response->json('data.orders_count'))->toBe(2)
        ->and($response->json('data.total_value'))->toBe(30000)
        ->and($response->json('data.average_basket'))->toBe(15000)
        ->and($response->json('data.address.city'))->toBe('Abidjan')
        ->and($response->json('data.address.line'))->toContain('Riviera 2')
        ->and($response->json('data.last_order.reference'))->toBe($newer->reference)
        ->and($response->json('data.first_order_at'))->not->toBeNull();

    expect($older)->not->toBeNull();
});

it('paginates a client order history, most recent first', function (): void {
    $client = Client::factory()->create();
    $first = Order::factory()->paid()->for($client)->create(['placed_at' => now()->subDays(2)]);
    $second = Order::factory()->paid()->for($client)->create(['placed_at' => now()->subDay()]);
    Order::factory()->draft()->for($client)->create();

    $this->actingAs(admin());

    $response = $this->getJson('/v1/admin/customers/'.$client->id.'/orders')->assertOk();

    expect($response->json('data'))->toHaveCount(2)
        ->and($response->json('data.0.reference'))->toBe($second->reference)
        ->and($response->json('data.1.reference'))->toBe($first->reference);
});
