<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Orders\Models\Delivery\Method;

it('guards delivery method endpoints', function (): void {
    $this->getJson('/v1/admin/delivery-methods')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/delivery-methods')->assertForbidden();
});

it('performs the delivery method lifecycle', function (): void {
    $this->actingAs(admin());

    $id = $this->postJson('/v1/admin/delivery-methods', [
        'slug' => 'abidjan-express',
        'name' => 'Abidjan Express',
        'zone' => 'Abidjan',
        'carrier' => 'Internal',
        'amount' => 2000,
    ])->assertCreated()
        ->assertJsonPath('data.slug', 'abidjan-express')
        ->assertJsonPath('data.amount', 2000)
        ->json('data.id');

    $this->putJson('/v1/admin/delivery-methods/'.$id, ['amount' => 2500])
        ->assertOk()
        ->assertJsonPath('data.amount', 2500);

    $this->deleteJson('/v1/admin/delivery-methods/'.$id)->assertNoContent();

    expect(Method::query()->count())->toBe(0);
});
