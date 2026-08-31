<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Quiz\Models\Option;
use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Rule;
use App\Modules\Quiz\Models\Submission;

it('matches a submission only when every condition is present', function (): void {
    $question = Question::factory()->create(['slug' => 'skin_concern']);
    $option = Option::factory()->create([
        'question_id' => $question->id,
        'value_code' => 'taches',
    ]);
    $other = Option::factory()->create([
        'question_id' => $question->id,
        'value_code' => 'eclat',
    ]);
    $product = Product::factory()->create();
    $rule = Rule::factory()->create([
        'product_id' => $product->id,
        'conditions' => ['skin_concern' => 'taches'],
        'priority' => 5,
    ]);

    $hit = Submission::factory()->create();
    $hit->answers()->create(['question_id' => $question->id, 'option_id' => $option->id]);

    $miss = Submission::factory()->create();
    $miss->answers()->create(['question_id' => $question->id, 'option_id' => $other->id]);

    expect($rule->matches($hit))->toBeTrue()
        ->and($rule->matches($miss))->toBeFalse()
        ->and($hit->recommendations()->pluck('id')->all())->toBe([$product->id]);
});
