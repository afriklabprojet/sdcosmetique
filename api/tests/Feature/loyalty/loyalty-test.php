<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use App\Modules\Loyalty\Models\WebhookLog;

it('credits a signup bonus when a client registers', function (): void {
    $this->postJson('/register', [
        'name' => 'Awa Kone',
        'email' => 'loyalty@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '+22501020304',
        'terms' => true,
    ])->assertSuccessful();

    $this->getJson('/api/loyalty-entries')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.points_delta', 20)
        ->assertJsonPath('data.0.reason', LoyaltyReason::SignupBonus->value)
        ->assertJsonPath('data.0.balance_after', 20);
});

it('guards customer loyalty entries', function (): void {
    $this->getJson('/api/loyalty-entries')->assertUnauthorized();
    $this->postJson('/api/loyalty-entries', [
        'points_delta' => -10,
        'description' => 'Reward',
    ])->assertUnauthorized();
});

it('lets a customer redeem points from their ledger', function (): void {
    $this->postJson('/register', [
        'name' => 'Awa Kone',
        'email' => 'redeem@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '+22501020304',
        'terms' => true,
    ])->assertSuccessful();

    $this->postJson('/api/loyalty-entries', [
        'points_delta' => -20,
        'description' => 'Récompense utilisée : -1 000 FCFA',
        'reference_id' => 'r100',
    ])->assertCreated()
        ->assertJsonPath('data.points_delta', -20)
        ->assertJsonPath('data.reason', LoyaltyReason::PointsRedemption->value)
        ->assertJsonPath('data.balance_after', 0);

    $this->postJson('/api/loyalty-entries', [
        'points_delta' => -10,
        'description' => 'Solde insuffisant',
    ])->assertUnprocessable();
});

it('rejects a customer credit on the redemption resource', function (): void {
    $this->postJson('/register', [
        'name' => 'Awa Kone',
        'email' => 'credit@example.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '+22501020304',
        'terms' => true,
    ])->assertSuccessful();

    $this->postJson('/api/loyalty-entries', [
        'points_delta' => 10,
        'description' => 'Not a redemption',
    ])->assertUnprocessable();
});

it('guards admin loyalty routes', function (): void {
    $this->getJson('/api/admin/loyalty/accounts')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/loyalty/accounts')->assertForbidden();
    $this->postJson('/api/admin/loyalty/adjustments', [
        'client_id' => 1,
        'points_delta' => 10,
        'description' => 'Gift',
    ])->assertForbidden();
});

it('lets an admin list accounts and store an adjustment', function (): void {
    $client = Client::factory()->create();
    Account::for($client)->credit(20, LoyaltyReason::SignupBonus, 'Welcome bonus');

    $this->actingAs(admin());

    $this->getJson('/api/admin/loyalty/accounts')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.current_points', 20);

    $this->getJson('/api/admin/loyalty/entries')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->postJson('/api/admin/loyalty/adjustments', [
        'client_id' => $client->id,
        'points_delta' => 15,
        'description' => 'Geste commercial',
    ])->assertCreated()
        ->assertJsonPath('data.points_delta', 15)
        ->assertJsonPath('data.reason', LoyaltyReason::AdminAdjustment->value)
        ->assertJsonPath('data.balance_after', 35);

    expect(Account::query()->where('client_id', $client->id)->value('current_points'))->toBe(35);
});

it('settles a signed jeko webhook and ignores replay', function (): void {
    $client = Client::factory()->create();
    $client->user->forceFill(['email' => 'buyer@example.com'])->save();

    $payload = json_encode([
        'id' => 'jeko-txn-1',
        'status' => 'success',
        'amount' => ['amount' => 5000, 'currency' => 'XOF'],
        'counterpartIdentifier' => 'buyer@example.com',
        'transactionDetails' => ['reference' => 'jeko-txn-1'],
    ], JSON_THROW_ON_ERROR);
    $signature = hash_hmac('sha256', $payload, 'testing-jeko-secret');

    $this->call(
        'POST',
        '/webhooks/jeko-pay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_JEKO_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk()->assertJsonPath('status', 'settled');

    $account = Account::query()->where('client_id', $client->id)->first();

    expect($account?->current_points)->toBe(50)
        ->and(Entry::query()->where('reason', LoyaltyReason::OrderReward)->count())->toBe(1)
        ->and(WebhookLog::query()->where('reference', 'jeko-txn-1')->first()?->processed_at)->not->toBeNull();

    $this->call(
        'POST',
        '/webhooks/jeko-pay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_JEKO_SIGNATURE' => $signature,
        ],
        $payload,
    )->assertOk()->assertJsonPath('status', 'replayed');

    expect(Entry::query()->where('reason', LoyaltyReason::OrderReward)->count())->toBe(1);
});

it('rejects an unsigned jeko webhook without returning 419', function (): void {
    $payload = json_encode(['id' => 'MISSING', 'status' => 'success'], JSON_THROW_ON_ERROR);

    $this->call(
        'POST',
        '/webhooks/jeko-pay',
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

it('does not overwrite a handled jeko log payload on unsigned replay', function (): void {
    WebhookLog::factory()->settled()->create([
        'reference' => 'HANDLED-JEKO',
        'payload' => ['id' => 'HANDLED-JEKO', 'status' => 'success', 'raw' => 'authentic'],
    ]);

    $forged = json_encode([
        'id' => 'HANDLED-JEKO',
        'status' => 'success',
        'raw' => 'forged',
    ], JSON_THROW_ON_ERROR);

    $this->call(
        'POST',
        '/webhooks/jeko-pay',
        [],
        [],
        [],
        [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
        ],
        $forged,
    )->assertOk()->assertJsonPath('status', 'replayed');

    expect(WebhookLog::query()->where('reference', 'HANDLED-JEKO')->first()?->payload['raw'])->toBe('authentic');
});
