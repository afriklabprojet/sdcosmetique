<?php

declare(strict_types=1);

namespace Database\Factories\Invoicing;

use App\Modules\Invoicing\Models\InvoiceNumberCounter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvoiceNumberCounter>
 */
class InvoiceNumberCounterFactory extends Factory
{
    protected $model = InvoiceNumberCounter::class;

    public function definition(): array
    {
        return [
            'year' => fake()->unique()->numberBetween(2020, 2100),
            'last_number' => 0,
        ];
    }
}
