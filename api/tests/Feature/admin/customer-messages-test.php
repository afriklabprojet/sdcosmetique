<?php

declare(strict_types=1);

use App\Jobs\SendCustomerMessageJob;
use App\Mail\CustomerMessageMail;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Models\CustomerMessage;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Mail;

it('rejects guests and non-admins', function (): void {
    $client = Client::factory()->create();

    $this->postJson('/v1/admin/customers/'.$client->id.'/messages', ['subject' => 'x', 'body' => 'y'])
        ->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->postJson('/v1/admin/customers/'.$client->id.'/messages', ['subject' => 'x', 'body' => 'y'])
        ->assertForbidden();
});

it('sends a message from the client record and dispatches the job exactly once (§5)', function (): void {
    Bus::fake();
    $admin = admin();
    $client = Client::factory()->create();

    $this->actingAs($admin);

    $response = $this->postJson('/v1/admin/customers/'.$client->id.'/messages', [
        'subject' => 'Votre commande',
        'body' => '<p>Bonjour <strong>'.$client->user->name.'</strong>, merci pour votre confiance.</p>',
    ])->assertCreated();

    expect($response->json('data.status'))->toBe('pending')
        ->and($response->json('data.recipient_email'))->toBe($client->user->email);

    Bus::assertDispatchedTimes(SendCustomerMessageJob::class, 1);

    $message = CustomerMessage::query()->first();
    expect($message->sent_by_user_id)->toBe($admin->id)
        ->and($message->body)->toContain('<strong>');
});

it('sanitizes the message body before storing it (§13)', function (): void {
    Bus::fake();
    $client = Client::factory()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/customers/'.$client->id.'/messages', [
        'subject' => 'Test',
        'body' => '<p onclick="evil()">Bonjour</p><script>alert(1)</script>',
    ])->assertCreated();

    $message = CustomerMessage::query()->first();
    expect($message->body)->not->toContain('onclick')
        ->and($message->body)->not->toContain('<script');
});

it('refuses to send to a client with no e-mail on file', function (): void {
    $user = User::factory()->create(['email' => 'placeholder@example.com']);
    $client = Client::factory()->for($user)->create();
    $user->forceFill(['email' => ''])->saveQuietly();

    $this->actingAs(admin());

    $this->postJson('/v1/admin/customers/'.$client->id.'/messages', ['subject' => 'x', 'body' => 'y'])
        ->assertStatus(422);
});

it('actually delivers the e-mail when the queued job runs', function (): void {
    Mail::fake();
    $client = Client::factory()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/customers/'.$client->id.'/messages', [
        'subject' => 'Merci pour votre commande',
        'body' => '<p>Un petit mot.</p>',
    ])->assertCreated();

    Mail::assertSent(CustomerMessageMail::class, fn (CustomerMessageMail $mail): bool => $mail->customerMessage->recipient_email === $client->user->email
        && $mail->envelope()->subject === 'Merci pour votre commande');

    expect(CustomerMessage::query()->first()->status)->toBe(CustomerMessage::STATUS_SENT);
});

it('lists sent messages globally and filtered by client (§11)', function (): void {
    $clientA = Client::factory()->create();
    $clientB = Client::factory()->create();
    CustomerMessage::factory()->for($clientA)->sent()->create();
    CustomerMessage::factory()->for($clientB)->sent()->create();

    $this->actingAs(admin());

    $this->getJson('/v1/admin/messages')->assertOk()->assertJsonCount(2, 'data');
    $this->getJson('/v1/admin/messages?client_id='.$clientA->id)->assertOk()->assertJsonCount(1, 'data');
});

it('resends a failed message through the same job (§11)', function (): void {
    Bus::fake();
    $message = CustomerMessage::factory()->failed()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/messages/'.$message->id.'/resend')
        ->assertOk()
        ->assertJsonPath('data.status', 'pending');

    Bus::assertDispatched(SendCustomerMessageJob::class, fn (SendCustomerMessageJob $job): bool => $job->messageId === $message->id);
    expect($message->fresh()->error)->toBeNull();
});
