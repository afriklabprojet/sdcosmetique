<?php

declare(strict_types=1);

namespace Database\Factories\Loyalty;

use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Enums\LoyaltyTier;
use App\Modules\Loyalty\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'current_points' => 0,
            'lifetime_points' => 0,
            'tier' => LoyaltyTier::Bronze,
            'tier_at' => now(),
        ];
    }
}
