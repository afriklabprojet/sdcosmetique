<?php

declare(strict_types=1);

namespace Database\Factories\Loyalty;

use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\Entry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Entry>
 */
class EntryFactory extends Factory
{
    protected $model = Entry::class;

    public function definition(): array
    {
        $delta = 20;

        return [
            'account_id' => Account::factory(),
            'points_delta' => $delta,
            'balance_after' => $delta,
            'reason' => LoyaltyReason::SignupBonus,
            'reference_type' => null,
            'reference_id' => null,
            'description' => 'Welcome bonus',
            'created_at' => now(),
        ];
    }
}
