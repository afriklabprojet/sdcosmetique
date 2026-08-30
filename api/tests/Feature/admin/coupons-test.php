<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Shopping\Models\Coupon;

it('guards coupon endpoints', function (): void {
    $this->getJson('/api/admin/coupons')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/api/admin/coupons')->assertForbidden();
});

it('performs the coupon lifecycle', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/api/admin/coupons', [
        'code' => 'WELCOME10',
        'type' => 'percentage',
        'value' => 10,
        'starts_at' => now()->toISOString(),
        'ends_at' => now()->addMonth()->toISOString(),
    ])->assertCreated()
        ->assertJsonPath('data.code', 'WELCOME10')
        ->assertJsonPath('data.type', 'percentage')
        ->json('data.id');

    $this->putJson('/api/admin/coupons/'.$id, ['value' => 15])
        ->assertOk()
        ->assertJsonPath('data.value', 15);

    $this->deleteJson('/api/admin/coupons/'.$id)->assertNoContent();

    expect(Coupon::query()->count())->toBe(0);
});

it('rejects a duplicate coupon code', function (): void {
    Coupon::factory()->create(['code' => 'DUP']);

    $this->actingAs(admin());

    $this->postJson('/api/admin/coupons', [
        'code' => 'DUP',
        'type' => 'fixed',
        'value' => 1000,
        'starts_at' => now()->toISOString(),
        'ends_at' => now()->addMonth()->toISOString(),
    ])->assertStatus(422)->assertJsonValidationErrors('code');
});
