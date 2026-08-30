<?php

declare(strict_types=1);

namespace Database\Factories\Orders;

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Order;
use App\Modules\Orders\Models\Order\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class OrderItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'title' => 'Hydraglow Daily Gel Cleanser',
            'label' => '30ml',
            'unit_price' => 25,
            'quantity' => 1,
            'total' => 25,
        ];
    }
}
