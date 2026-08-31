<?php

declare(strict_types=1);

use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Models\Account;

it('rejects a zero ledger delta', function (): void {
    $account = Account::for(Client::factory()->create());

    expect(fn () => $account->credit(0, LoyaltyReason::AdminAdjustment, 'noop'))
        ->toThrow(DomainException::class, 'A ledger delta cannot be zero.');
});

it('rejects a debit that would go negative', function (): void {
    $account = Account::for(Client::factory()->create());
    $account->credit(10, LoyaltyReason::SignupBonus, 'seed');

    expect(fn () => $account->credit(-20, LoyaltyReason::AdminAdjustment, 'too much'))
        ->toThrow(DomainException::class, 'Loyalty balance cannot go negative.');

    expect($account->refresh()->current_points)->toBe(10);
});

it('writes a ledger row and updates balances', function (): void {
    $account = Account::for(Client::factory()->create());
    $entry = $account->credit(20, LoyaltyReason::SignupBonus, 'Welcome bonus', 'user', '1');

    expect($account->current_points)->toBe(20)
        ->and($account->lifetime_points)->toBe(20)
        ->and($entry->points_delta)->toBe(20)
        ->and($entry->balance_after)->toBe(20)
        ->and($entry->reason)->toBe(LoyaltyReason::SignupBonus);
});
