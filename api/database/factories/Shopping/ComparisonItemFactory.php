<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Models\Comparison\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class ComparisonItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'client_id' => Client::factory(),
            'product_id' => Product::factory(),
        ];
    }
}
