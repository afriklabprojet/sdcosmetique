<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Testimonials\Models\Testimonial;

it('lists only approved testimonials', function (): void {
    Testimonial::factory()->create(['name' => 'Awa']);
    Testimonial::factory()->pending()->create(['name' => 'Hidden']);

    $this->getJson('/v1/testimonials')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Awa');
});

it('guards admin testimonials', function (): void {
    $this->getJson('/v1/admin/testimonials')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/testimonials')->assertForbidden();
});

it('accepts a public testimonial store as pending', function (): void {
    $this->postJson('/v1/testimonials', [
        'name' => 'Fatou',
        'text' => 'Peau lumineuse après deux semaines.',
    ])->assertCreated()
        ->assertJsonPath('data.name', 'Fatou');

    expect(Testimonial::query()->whereNull('approved_at')->count())->toBe(1);
    $this->getJson('/v1/testimonials')->assertJsonCount(0, 'data');
});

it('lets an admin moderate testimonials', function (): void {
    $row = Testimonial::factory()->pending()->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/testimonials')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.approved', false);

    $this->patchJson('/v1/admin/testimonials/'.$row->id, ['approved' => true])
        ->assertOk()
        ->assertJsonPath('data.approved', true);

    $this->deleteJson('/v1/admin/testimonials/'.$row->id)->assertNoContent();

    expect(Testimonial::query()->count())->toBe(0);
});
