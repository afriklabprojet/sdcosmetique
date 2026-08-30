<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Content\Models\Banner;
use App\Modules\Content\Models\Page;

it('guards the banner admin endpoints', function (): void {
    $this->getJson('/api/admin/banners')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/banners')->assertForbidden();
});

it('creates, updates and deletes a banner with translations', function (): void {
    $this->actingAs(admin());

    $created = $this->postJson('/api/admin/banners', [
        'key' => 'homepage-hero',
        'title' => 'Bienvenue',
        'subtitle' => 'Sous-titre',
        'image_url' => 'https://cdn.example.com/hero.jpg',
        'order' => 1,
        'translations' => [
            ['locale' => 'en', 'field' => 'title', 'value' => 'Welcome'],
        ],
    ])->assertCreated()
        ->assertJsonPath('data.key', 'homepage-hero')
        ->assertJsonPath('data.title', 'Bienvenue')
        ->assertJsonPath('data.translations.0.value', 'Welcome')
        ->json('data.id');

    $this->putJson('/api/admin/banners/'.$created, [
        'title' => 'Bienvenue mis a jour',
    ])->assertOk()->assertJsonPath('data.title', 'Bienvenue mis a jour');

    $this->deleteJson('/api/admin/banners/'.$created)->assertNoContent();

    expect(Banner::query()->find($created))->toBeNull();
});

it('validates banner uniqueness', function (): void {
    Banner::factory()->create(['key' => 'taken']);

    $this->actingAs(admin());

    $this->postJson('/api/admin/banners', ['key' => 'taken', 'title' => 'x'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('key');
});

it('creates and updates a page', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/api/admin/pages', [
        'slug' => 'about',
        'title' => 'A propos',
        'content' => 'Contenu',
        'published_at' => now()->toISOString(),
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'about')
        ->json('data.id');

    $this->putJson('/api/admin/pages/'.$id, ['title' => 'A propos v2'])
        ->assertOk()
        ->assertJsonPath('data.title', 'A propos v2');

    expect(Page::query()->count())->toBe(1);
});
