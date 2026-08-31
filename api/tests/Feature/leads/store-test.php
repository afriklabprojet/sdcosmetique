<?php

declare(strict_types=1);

use App\Modules\Leads\Models\Contact\Message;
use App\Modules\Leads\Models\Newsletter\Subscription;

it('confirms a newsletter subscription at store', function (): void {
    $this->postJson('/v1/newsletter-subscriptions', ['email' => 'reader@example.com'])
        ->assertCreated()
        ->assertJsonPath('data.email', 'reader@example.com');

    $row = Subscription::query()->where('email', 'reader@example.com')->first();

    expect($row)->not->toBeNull()
        ->and($row?->confirmed_at)->not->toBeNull();
});

it('persists a contact message', function (): void {
    $this->postJson('/v1/contact-messages', [
        'name' => 'Awa',
        'email' => 'awa@example.com',
        'subject' => 'Routine',
        'message' => 'Which cleanser should I start with?',
    ])->assertCreated();

    expect(Message::query()->where('email', 'awa@example.com')->exists())->toBeTrue();
});

it('validates lead payloads', function (): void {
    $this->postJson('/v1/newsletter-subscriptions', ['email' => 'not-an-email'])->assertUnprocessable();
    $this->postJson('/v1/contact-messages', ['name' => 'Awa'])->assertUnprocessable();
});
