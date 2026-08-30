<?php

declare(strict_types=1);

namespace Database\Factories\Catalog;

use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'title' => $title,
            'summary' => fake()->sentence(),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####')),
            'regular_price' => 25000,
            'stock' => 10,
            'visible_at' => now(),
            'published_at' => now(),
        ];
    }

    public function child(?Product $parent = null): static
    {
        return $this->state(function (array $attributes) use ($parent): array {
            $parent ??= Product::factory()->create(['parent_id' => null, 'regular_price' => null, 'stock' => 0]);

            return [
                'category_id' => $parent->category_id,
                'parent_id' => $parent->id,
                'label' => '50ml',
                'regular_price' => 25000,
                'stock' => 8,
            ];
        });
    }

    public function parentProduct(): static
    {
        return $this->state(fn (array $attributes): array => [
            'parent_id' => null,
            'regular_price' => null,
            'stock' => 0,
        ]);
    }
}
