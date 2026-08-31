<?php

declare(strict_types=1);

namespace Database\Factories\Testimonials;

use App\Modules\Testimonials\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    protected $model = Testimonial::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'text' => fake()->sentence(12),
            'avatar_url' => fake()->imageUrl(100, 100, 'people'),
            'approved_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => ['approved_at' => null]);
    }
}
