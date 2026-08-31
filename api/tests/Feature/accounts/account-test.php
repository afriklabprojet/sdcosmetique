<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Address;
use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Notification;

it('registers a client and returns the account payload', function (): void {
    $this->postJson('/register', [
        'name' => 'Awa Kone',
        'email' => 'awa@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '+22501020304',
        'terms' => true,
    ])->assertSuccessful();

    $this->getJson('/v1/account')
        ->assertOk()
        ->assertJsonPath('data.email', 'awa@example.com')
        ->assertJsonPath('data.phone', '+22501020304');
});

it('manages the authenticated address book', function (): void {
    $client = Client::factory()->create();
    $this->actingAs($client->user);

    $this->postJson('/v1/account/addresses', [
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Cocody',
        'city' => 'Abidjan',
        'country' => 'CI',
        'phone' => '+22501020304',
    ])->assertCreated()->assertJsonPath('data.city', 'Abidjan');

    $address = Address::query()->firstOrFail();

    $this->getJson('/v1/account/addresses')->assertOk()->assertJsonCount(1, 'data');
    $this->putJson('/v1/account/addresses/'.$address->id, [
        'first_name' => 'Awa',
        'last_name' => 'Kone',
        'line_1' => 'Marcory',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertOk()->assertJsonPath('data.line_1', 'Marcory');

    $this->deleteJson('/v1/account/addresses/'.$address->id)->assertNoContent();
});

it('returns 404 when a client accesses another clients address', function (): void {
    $owner = Client::factory()->create();
    $intruder = Client::factory()->create();
    $address = Address::factory()->create(['client_id' => $owner->id]);

    $this->actingAs($intruder->user);

    $this->getJson('/v1/account/addresses/'.$address->id)->assertNotFound();
    $this->putJson('/v1/account/addresses/'.$address->id, [
        'first_name' => 'Intruder',
        'last_name' => 'User',
        'line_1' => 'Elsewhere',
        'city' => 'Abidjan',
        'country' => 'CI',
    ])->assertNotFound();
    $this->deleteJson('/v1/account/addresses/'.$address->id)->assertNotFound();
});

it('returns 404 when a client accesses another clients order', function (): void {
    $owner = Client::factory()->create();
    $intruder = Client::factory()->create();
    $order = Order::factory()->placed()->create([
        'client_id' => $owner->id,
        'email' => 'owner@example.com',
    ]);

    $this->actingAs($intruder->user);

    $this->getJson('/v1/account/orders/'.$order->reference)->assertNotFound();
});

it('points password reset links at the storefront', function (): void {
    $client = Client::factory()->create();

    Notification::fake();

    $this->postJson('/forgot-password', [
        'email' => $client->user->email,
    ])->assertSuccessful();

    Notification::assertSentTo(
        $client->user,
        ResetPassword::class,
        function (ResetPassword $notification) use ($client): bool {
            $url = $notification->toMail($client->user)->actionUrl ?? '';

            return str_contains($url, 'http://localhost:3000/reset-password');
        },
    );
});
