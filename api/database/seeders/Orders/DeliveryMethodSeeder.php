<?php

declare(strict_types=1);

namespace Database\Seeders\Orders;

use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Database\Seeder;

class DeliveryMethodSeeder extends Seeder
{
    public function run(): void
    {
        Method::query()->updateOrCreate(
            ['slug' => 'abidjan-standard-placeholder'],
            [
                'name' => 'Abidjan standard (placeholder tariff)',
                'zone' => 'Abidjan',
                'carrier' => 'placeholder',
                'amount' => 2000,
                'cost' => 1500,
                'position' => 0,
                'visible_at' => now(),
            ],
        );
    }
}
