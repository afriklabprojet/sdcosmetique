<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Settings\Models\Setting;

it('lists and shows only public settings', function (): void {
    Setting::factory()->create(['key' => 'hero', 'value' => ['title' => 'Visage']]);
    Setting::factory()->private()->create(['key' => 'jeko', 'value' => ['apiKey' => 'secret']]);

    $this->getJson('/v1/settings')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.key', 'hero')
        ->assertJsonMissing(['apiKey' => 'secret']);

    $this->getJson('/v1/settings/hero')
        ->assertOk()
        ->assertJsonPath('data.value.title', 'Visage');

    $this->getJson('/v1/settings/jeko')->assertNotFound();
    $this->getJson('/v1/settings/missing')->assertNotFound();
});

it('guards admin settings', function (): void {
    Setting::factory()->create(['key' => 'hero']);

    $this->getJson('/v1/admin/settings')->assertUnauthorized();
    $this->patchJson('/v1/admin/settings/hero', ['value' => ['title' => 'X']])->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/settings')->assertForbidden();
    $this->patchJson('/v1/admin/settings/hero', ['value' => ['title' => 'X']])->assertForbidden();
});

it('lets an admin list every setting and update a row', function (): void {
    Setting::factory()->create(['key' => 'hero', 'value' => ['title' => 'Old']]);
    Setting::factory()->private()->create(['key' => 'jeko', 'value' => ['apiKey' => 'secret']]);

    $this->actingAs(admin());

    $this->getJson('/v1/admin/settings')
        ->assertOk()
        ->assertJsonCount(2, 'data');

    $this->getJson('/v1/admin/settings/jeko')
        ->assertOk()
        ->assertJsonPath('data.is_public', false)
        ->assertJsonPath('data.value.apiKey', 'secret');

    $this->patchJson('/v1/admin/settings/hero', [
        'value' => ['title' => 'New'],
        'is_public' => true,
    ])->assertOk()
        ->assertJsonPath('data.value.title', 'New');

    expect(Setting::query()->find('hero')?->value)->toBe(['title' => 'New']);
});
