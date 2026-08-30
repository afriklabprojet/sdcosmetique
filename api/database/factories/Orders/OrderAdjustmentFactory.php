<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Enums\Operation;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\Order\Adjustment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Adjustment>
 */
class OrderAdjustmentFactory extends Factory
{
    protected $model = Adjustment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'type' => AdjustmentType::Shipping,
            'operation' => Operation::Add,
            'amount' => 2000,
            'label' => 'Standard delivery',
        ];
    }
}
