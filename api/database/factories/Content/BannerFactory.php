<?php

declare(strict_types=1);

namespace Database\Factories\Content;

use App\Modules\Content\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'key' => Str::slug(fake()->unique()->words(2, true)),
            'title' => fake()->sentence(4),
            'image_url' => '/assets/images/slider/slider-2.jpg',
            'link_url' => '/shop',
            'order' => 0,
            'visible_at' => now(),
        ];
    }
}
