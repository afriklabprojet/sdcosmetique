<?php

declare(strict_types=1);

namespace Database\Factories\Catalog;

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\Product\Badge;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Badge>
 */
class ProductBadgeFactory extends Factory
{
    protected $model = Badge::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'label' => 'BEST SELLER',
            'type' => 'sale',
        ];
    }
}
