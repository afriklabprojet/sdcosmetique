<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Orders\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),
            'gateway' => 'null',
            'reference' => strtoupper((string) Str::ulid()),
            'currency' => 'XOF',
            'subtotal' => 0,
            'total' => 0,
            'destination' => [
                'first_name' => 'Awa',
                'last_name' => 'Kone',
                'line_1' => 'Cocody',
                'city' => 'Abidjan',
                'country' => 'CI',
                'phone' => '+22500000000',
            ],
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes): array => [
            'placed_at' => null,
        ]);
    }

    public function placed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'placed_at' => now(),
            'subtotal' => 25000,
            'total' => 27000,
        ]);
    }

    public function paid(): static
    {
        return $this->placed()->state(fn (array $attributes): array => [
            'paid_at' => now(),
        ]);
    }
}
