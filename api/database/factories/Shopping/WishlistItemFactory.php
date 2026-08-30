<?php

declare(strict_types=1);

namespace Database\Factories\Shopping;

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Models\Wishlist\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Item>
 */
class WishlistItemFactory extends Factory
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
