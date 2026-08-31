<?php

declare(strict_types=1);

use App\Models\User;
use App\Modules\Leads\Models\Contact\Message;
use App\Modules\Leads\Models\Newsletter\Subscription;

it('guards lead endpoints', function (): void {
    $this->getJson('/v1/admin/contact-messages')->assertUnauthorized();
    $this->getJson('/v1/admin/newsletter-subscriptions')->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->getJson('/v1/admin/contact-messages')->assertForbidden();
    $this->getJson('/v1/admin/newsletter-subscriptions')->assertForbidden();
});

it('lists, shows and resolves contact messages', function (): void {
    $message = Message::factory()->create(['handled_at' => null]);

    $this->actingAs(admin());

    $this->getJson('/v1/admin/contact-messages')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.open', true);

    $this->getJson('/v1/admin/contact-messages?status=handled')
        ->assertOk()
        ->assertJsonCount(0, 'data');

    $this->patchJson('/v1/admin/contact-messages/'.$message->id, ['handled' => true])
        ->assertOk()
        ->assertJsonPath('data.open', false);

    expect($message->refresh()->handled_at)->not->toBeNull();
});

it('lists and deletes newsletter subscriptions', function (): void {
    $subscription = Subscription::factory()->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/newsletter-subscriptions')
        ->assertOk()
        ->assertJsonCount(1, 'data');

    $this->deleteJson('/v1/admin/newsletter-subscriptions/'.$subscription->id)
        ->assertNoContent();

    expect(Subscription::query()->count())->toBe(0);
});
