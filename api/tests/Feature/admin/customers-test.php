<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Accounts\Models\Client;

it('rejects guests and non-admins from the customer list', function (): void {
    Client::factory()->count(2)->create();

    $this->getJson('/api/admin/customers')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/customers')->assertForbidden();
});

it('lists customers for an admin', function (): void {
    Client::factory()->count(3)->create();

    $this->actingAs(admin());

    $this->getJson('/api/admin/customers')
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure(['data' => [['id', 'name', 'email', 'phone', 'orders_count', 'total_value']]]);
});

it('shows a single customer for an admin', function (): void {
    $client = Client::factory()->create();

    $this->actingAs(admin());

    $this->getJson('/api/admin/customers/'.$client->id)
        ->assertOk()
        ->assertJsonPath('data.id', $client->id)
        ->assertJsonPath('data.email', $client->user->email);
});
