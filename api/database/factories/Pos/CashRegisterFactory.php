<?php

declare(strict_types=1);

namespace Database\Factories\Pos;

use App\Modules\Pos\Models\CashRegister;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CashRegister>
 */
class CashRegisterFactory extends Factory
{
    protected $model = CashRegister::class;

    public function definition(): array
    {
        return [
            'name' => 'Caisse '.fake()->unique()->numberBetween(1, 999),
            'location' => 'Boutique Cocody',
            'active' => true,
        ];
    }
}
