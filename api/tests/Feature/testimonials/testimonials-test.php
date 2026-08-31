<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Testimonials\Models\Testimonial;

it('lists only approved testimonials', function (): void {
    Testimonial::factory()->create(['name' => 'Awa']);
    Testimonial::factory()->pending()->create(['name' => 'Hidden']);

    $this->getJson('/api/testimonials')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Awa');
});

it('guards admin testimonials', function (): void {
    $this->getJson('/api/admin/testimonials')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/testimonials')->assertForbidden();
});

it('lets an admin moderate testimonials', function (): void {
    $row = Testimonial::factory()->pending()->create();

    $this->actingAs(admin());

    $this->getJson('/api/admin/testimonials')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.approved', false);

    $this->patchJson('/api/admin/testimonials/'.$row->id, ['approved' => true])
        ->assertOk()
        ->assertJsonPath('data.approved', true);

    $this->deleteJson('/api/admin/testimonials/'.$row->id)->assertNoContent();

    expect(Testimonial::query()->count())->toBe(0);
});
