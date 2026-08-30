<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Models\Coupon;
use App\Modules\Shopping\Models\CouponRedemption;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CouponRedemption>
 */
class CouponRedemptionFactory extends Factory
{
    protected $model = CouponRedemption::class;

    public function definition(): array
    {
        return [
            'coupon_id' => Coupon::factory(),
            'client_id' => null,
            'email' => fake()->safeEmail(),
            'order_id' => Order::factory(),
        ];
    }
}
