<?php

declare(strict_types=1);

namespace Database\Factories\Pos;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Models\Order;
use App\Modules\Pos\Models\Refund;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Refund>
 */
class RefundFactory extends Factory
{
    protected $model = Refund::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'admin_id' => Admin::factory(),
            'amount' => 1_000,
            'method' => 'cash',
            'reason' => 'Retour client',
            'created_at' => now(),
        ];
    }
}
