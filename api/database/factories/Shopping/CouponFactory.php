<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Shopping\Enums\CouponType;
use App\Modules\Shopping\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->bothify('SAVE##')),
            'type' => CouponType::Percentage,
            'value' => 15,
            'threshold' => null,
            'limit' => null,
            'quota' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
        ];
    }

    public function fixed(int $amount = 5000): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CouponType::Fixed,
            'value' => $amount,
        ]);
    }
}
