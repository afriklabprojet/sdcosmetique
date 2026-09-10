<?php

declare(strict_types=1);

namespace Database\Factories\Invoicing;

use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory()->paid(),
            'number' => sprintf('SDC-%d-%06d', now()->year, fake()->unique()->numberBetween(1, 999999)),
            'issued_at' => now(),
            'email_status' => Invoice::STATUS_NOT_SENT,
        ];
    }
}
