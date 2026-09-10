<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Orders\Models\OrderNumberCounter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderNumberCounter>
 */
class OrderNumberCounterFactory extends Factory
{
    protected $model = OrderNumberCounter::class;

    public function definition(): array
    {
        return [
            'year' => fake()->unique()->numberBetween(2020, 2100),
            'last_number' => 0,
        ];
    }
}
