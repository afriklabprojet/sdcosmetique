<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Method>
 */
class DeliveryMethodFactory extends Factory
{
    protected $model = Method::class;

    public function definition(): array
    {
        $name = 'Standard delivery (placeholder tariff)';

        return [
            'slug' => Str::slug($name).'-'.fake()->unique()->numerify('##'),
            'name' => $name,
            'zone' => 'Abidjan',
            'carrier' => 'placeholder',
            'amount' => 2000,
            'cost' => 1500,
            'position' => 0,
            'visible_at' => now(),
        ];
    }
}
