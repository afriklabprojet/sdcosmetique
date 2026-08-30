<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Models\Cart;
use App\Modules\Shopping\Models\Cart\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class CartItemFactory extends Factory
{
    protected $model = Item::class;

    public function definition(): array
    {
        return [
            'cart_id' => Cart::factory(),
            'product_id' => Product::factory(),
            'quantity' => 1,
        ];
    }
}
