<?php

declare(strict_types=1);

namespace Database\Factories\Quiz;

use App\Modules\Quiz\Models\Option;
use App\Modules\Quiz\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Option>
 */
class OptionFactory extends Factory
{
    protected $model = Option::class;

    public function definition(): array
    {
        $label = fake()->unique()->words(2, true);

        return [
            'question_id' => Question::factory(),
            'label' => $label,
            'description' => fake()->sentence(),
            'value_code' => Str::slug($label).'-'.fake()->unique()->numerify('##'),
            'glyph' => '◯',
            'sort_order' => fake()->numberBetween(0, 10),
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (): array => ['archived_at' => now()]);
    }
}
