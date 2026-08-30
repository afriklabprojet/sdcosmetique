<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Orders\Models\Delivery;
use App\Modules\Orders\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Delivery>
 */
class DeliveryFactory extends Factory
{
    protected $model = Delivery::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->placed(),
            'carrier' => 'placeholder',
            'cost' => 1500,
        ];
    }
}
