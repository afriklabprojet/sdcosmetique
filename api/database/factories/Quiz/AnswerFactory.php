<?php

declare(strict_types=1);

namespace Database\Factories\Quiz;

use App\Modules\Quiz\Models\Answer;
use App\Modules\Quiz\Models\Option;
use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Answer>
 */
class AnswerFactory extends Factory
{
    protected $model = Answer::class;

    public function definition(): array
    {
        $question = Question::factory();

        return [
            'submission_id' => Submission::factory(),
            'question_id' => $question,
            'option_id' => Option::factory()->state([
                'question_id' => $question,
            ]),
        ];
    }
}
