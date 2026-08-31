<?php

declare(strict_types=1);

namespace Database\Factories\Quiz;

use App\Modules\Catalog\Models\Product;
use App\Modules\Quiz\Enums\QuizTier;
use App\Modules\Quiz\Models\Rule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Rule>
 */
class RuleFactory extends Factory
{
    protected $model = Rule::class;

    public function definition(): array
    {
        return [
            'conditions' => ['skin_concern' => 'taches'],
            'product_id' => Product::factory(),
            'tier' => QuizTier::Essential,
            'priority' => 0,
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (): array => ['archived_at' => now()]);
    }
}
