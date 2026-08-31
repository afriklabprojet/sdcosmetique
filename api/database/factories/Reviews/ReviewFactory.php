<?php

declare(strict_types=1);

namespace Database\Factories\Reviews;

use App\Modules\Catalog\Models\Product;
use App\Modules\Reviews\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'author_name' => fake()->name(),
            'author_city' => fake()->city(),
            'rating' => fake()->numberBetween(1, 5),
            'title' => fake()->sentence(3),
            'content' => fake()->paragraph(),
            'skin_tone' => null,
            'verified_at' => now(),
            'approved_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => [
            'approved_at' => null,
            'verified_at' => null,
        ]);
    }
}
