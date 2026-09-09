<?php

declare(strict_types=1);

use App\Modules\Content\Models\Page;

it('creates and updates a page', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/pages', [
        'slug' => 'about',
        'title' => 'A propos',
        'content' => 'Contenu',
        'published_at' => now()->toISOString(),
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'about')
        ->json('data.id');

    $this->putJson('/v1/admin/pages/'.$id, ['title' => 'A propos v2'])
        ->assertOk()
        ->assertJsonPath('data.title', 'A propos v2');

    expect(Page::query()->count())->toBe(1);
});

it('keeps only the last value when a translation entry repeats locale+field', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/pages', [
        'slug' => 'duplicate-locale',
        'title' => 'Titre',
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => 'First'],
            ['locale' => 'en', 'field' => 'title', 'value' => 'Second'],
        ],
    ])->assertCreated()->json('data.id');

    $translations = $this->getJson('/v1/admin/pages/'.$id)
        ->assertOk()
        ->json('data.translations');

    expect($translations)->toHaveCount(1)
        ->and($translations[0]['value'])->toBe('Second');
});

it('updates only the translation fields sent, leaving others untouched', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/pages', [
        'slug' => 'partial-update',
        'title' => 'Titre',
        'content' => 'Contenu',
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => 'English title'],
            ['locale' => 'en', 'field' => 'content', 'value' => 'English content'],
        ],
    ])->assertCreated()->json('data.id');

    $this->putJson('/v1/admin/pages/'.$id, [
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => 'Updated English title'],
        ],
    ])->assertOk();

    $translations = collect(
        $this->getJson('/v1/admin/pages/'.$id)->assertOk()->json('data.translations')
    )->keyBy('field');

    expect($translations['title']['value'])->toBe('Updated English title')
        ->and($translations['content']['value'])->toBe('English content');
});

it('deletes a translation row when its value is sent as null', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/pages', [
        'slug' => 'clear-translation',
        'title' => 'Titre',
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => 'English title'],
        ],
    ])->assertCreated()->json('data.id');

    $this->putJson('/v1/admin/pages/'.$id, [
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => null],
        ],
    ])->assertOk();

    $translations = $this->getJson('/v1/admin/pages/'.$id)->assertOk()->json('data.translations');

    expect($translations)->toBeEmpty();
});

it('silently ignores a translation field that is not translatable', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/pages', [
        'slug' => 'unknown-field',
        'title' => 'Titre',
        'translations' => [
            ['locale' => 'en', 'field' => 'slug', 'value' => 'not-allowed'],
        ],
    ])->assertCreated()->json('data.id');

    $translations = $this->getJson('/v1/admin/pages/'.$id)->assertOk()->json('data.translations');

    expect($translations)->toBeEmpty();
});
