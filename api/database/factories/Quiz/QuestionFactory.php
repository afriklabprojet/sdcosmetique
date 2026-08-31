<?php

declare(strict_types=1);

namespace Database\Factories\Quiz;

use App\Modules\Quiz\Enums\QuestionType;
use App\Modules\Quiz\Models\Question;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    protected $model = Question::class;

    public function definition(): array
    {
        $title = fake()->unique()->sentence(4);

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('##'),
            'title' => $title,
            'subtitle' => fake()->sentence(),
            'question_type' => QuestionType::SingleChoice,
            'sort_order' => fake()->numberBetween(0, 10),
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (): array => ['archived_at' => now()]);
    }
}
