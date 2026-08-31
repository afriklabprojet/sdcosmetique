<?php

declare(strict_types=1);

namespace Database\Factories\Quiz;

use App\Modules\Quiz\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Submission>
 */
class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'client_id' => null,
            'email' => fake()->safeEmail(),
            'first_name' => fake()->firstName(),
            'phone' => fake()->numerify('+225########'),
            'completed_at' => now(),
        ];
    }
}
