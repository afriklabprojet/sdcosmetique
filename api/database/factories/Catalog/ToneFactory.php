<?php

declare(strict_types=1);

namespace Database\Factories\Catalog;

use App\Modules\Catalog\Models\Tone;
use Illuminate\Database\Eloquent\Factories\Factory;

class ToneFactory extends Factory
{
    protected $model = Tone::class;

    public function definition(): array
    {
        return [
            'slug' => $this->faker->unique()->slug,
            'label' => $this->faker->word,
        ];
    }
}
