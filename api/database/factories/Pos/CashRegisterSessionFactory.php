<?php

declare(strict_types=1);

namespace Database\Factories\Pos;

use App\Modules\Identity\Models\Admin;
use App\Modules\Pos\Models\CashRegister;
use App\Modules\Pos\Models\CashRegisterSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashRegisterSession>
 */
class CashRegisterSessionFactory extends Factory
{
    protected $model = CashRegisterSession::class;

    public function definition(): array
    {
        return [
            'cash_register_id' => CashRegister::factory(),
            'admin_id' => Admin::factory(),
            'opening_balance' => 20_000,
            'status' => 'open',
            'opened_at' => now(),
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (): array => [
            'status' => 'closed',
            'expected_cash' => 20_000,
            'actual_cash' => 20_000,
            'difference' => 0,
            'closed_at' => now(),
        ]);
    }
}
