<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Quiz\Enums\QuestionType;
use App\Modules\Quiz\Models\Option;
use App\Modules\Quiz\Models\Question;
use App\Modules\Quiz\Models\Rule;
use App\Modules\Quiz\Models\Submission;

it('lists active questions with their options', function (): void {
    $question = Question::factory()->create([
        'slug' => 'skin_concern',
        'title' => 'Préoccupation',
        'sort_order' => 1,
    ]);
    Option::factory()->create([
        'question_id' => $question->id,
        'value_code' => 'taches',
        'label' => 'Taches',
    ]);
    Option::factory()->archived()->create(['question_id' => $question->id]);
    Question::factory()->archived()->create();

    $this->getJson('/api/quiz-questions')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.slug', 'skin_concern')
        ->assertJsonCount(1, 'data.0.options')
        ->assertJsonPath('data.0.options.0.value_code', 'taches');
});

it('stores a submission and returns matching recommendations', function (): void {
    $question = Question::factory()->create(['slug' => 'skin_concern']);
    Option::factory()->create([
        'question_id' => $question->id,
        'value_code' => 'taches',
        'label' => 'Taches',
    ]);
    $product = Rule::factory()->create([
        'conditions' => ['skin_concern' => 'taches'],
        'priority' => 10,
    ])->product;

    $response = $this->postJson('/api/quiz-submissions', [
        'email' => 'awa@example.com',
        'first_name' => 'Awa',
        'answers' => [
            ['question' => 'skin_concern', 'option' => 'taches'],
        ],
    ])->assertCreated()
        ->assertJsonPath('data.email', 'awa@example.com')
        ->assertJsonPath('data.answers.0.question', 'skin_concern')
        ->assertJsonPath('data.answers.0.option', 'taches');

    expect($response->json('data.recommendations.0.slug'))->toBe($product->slug)
        ->and(Submission::query()->count())->toBe(1);

    $this->getJson('/api/quiz-submissions/'.$response->json('data.id'))
        ->assertOk()
        ->assertJsonPath('data.email', 'awa@example.com');
});

it('rejects unknown answers', function (): void {
    $this->postJson('/api/quiz-submissions', [
        'email' => 'awa@example.com',
        'answers' => [
            ['question' => 'missing', 'option' => 'nope'],
        ],
    ])->assertUnprocessable();
});

it('guards admin quiz questions', function (): void {
    $this->getJson('/api/admin/quiz-questions')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/quiz-questions')->assertForbidden();
});

it('lets an admin sync question options', function (): void {
    $this->actingAs(admin());

    $created = $this->postJson('/api/admin/quiz-questions', [
        'slug' => 'skin_concern',
        'title' => 'Préoccupation',
        'question_type' => QuestionType::SingleChoice->value,
        'sort_order' => 1,
        'options' => [
            ['label' => 'Taches', 'value_code' => 'taches', 'glyph' => '◐'],
            ['label' => 'Éclat', 'value_code' => 'eclat', 'glyph' => '☼'],
        ],
    ])->assertCreated()
        ->assertJsonCount(2, 'data.options');

    $id = $created->json('data.id');

    $this->patchJson('/api/admin/quiz-questions/'.$id, [
        'title' => 'Votre préoccupation',
        'options' => [
            ['id' => $created->json('data.options.0.id'), 'label' => 'Taches', 'value_code' => 'taches'],
        ],
    ])->assertOk()
        ->assertJsonPath('data.title', 'Votre préoccupation')
        ->assertJsonCount(2, 'data.options');

    expect(Option::query()->whereNotNull('archived_at')->count())->toBe(1);

    $this->getJson('/api/admin/quiz-submissions')->assertOk()->assertJsonCount(0, 'data');
});
