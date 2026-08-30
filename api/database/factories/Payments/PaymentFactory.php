<?php

declare(strict_types=1);

namespace Database\Factories\Payments;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->placed(),
            'amount' => 27000,
            'currency' => 'XOF',
        ];
    }
}
