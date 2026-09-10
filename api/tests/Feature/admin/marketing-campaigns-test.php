<?php

declare(strict_types=1);

use App\Jobs\SendMarketingCampaignEmailJob;
use App\Mail\MarketingCampaignMail;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Messaging\Enums\CampaignStatus;
use App\Modules\Messaging\Models\MarketingCampaign;
use App\Modules\Messaging\Models\MarketingCampaignRecipient;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

function draftCampaignPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Promo rentrée',
        'subject' => '-20% sur toute la gamme',
        'sender_name' => 'SD Cosmétique',
        'sender_email' => 'contact@sdcosmetique.ci',
        'content' => '<p>Profitez de -20% <strong>cette semaine</strong>.</p>',
        'audience_type' => 'all',
    ], $overrides);
}

it('rejects guests and non-admins', function (): void {
    $this->postJson('/v1/admin/marketing-campaigns', draftCampaignPayload())->assertUnauthorized();

    $this->actingAs(User::factory()->create());
    $this->postJson('/v1/admin/marketing-campaigns', draftCampaignPayload())->assertForbidden();
});

it('creates a draft campaign with sanitized content (§6, §13)', function (): void {
    $this->actingAs(admin());

    $response = $this->postJson('/v1/admin/marketing-campaigns', draftCampaignPayload([
        'content' => '<p onclick="evil()">Bonjour</p><script>alert(1)</script>',
    ]))->assertCreated();

    expect($response->json('data.status'))->toBe('draft')
        ->and($response->json('data.content'))->not->toContain('onclick')
        ->and($response->json('data.content'))->not->toContain('<script');
});

it('computes a live recipient count per audience segment (§6)', function (): void {
    $this->actingAs(admin());

    $active = Client::factory()->create(['marketing_opt_in' => true]);
    Order::factory()->paid()->for($active)->create(['placed_at' => now()->subDays(5)]);

    $inactive = Client::factory()->create(['marketing_opt_in' => true]);
    Order::factory()->paid()->for($inactive)->create(['placed_at' => now()->subDays(200)]);

    $neverOrdered = Client::factory()->create(['marketing_opt_in' => true]);

    $optedOut = Client::factory()->create(['marketing_opt_in' => false]);
    Order::factory()->paid()->for($optedOut)->create(['placed_at' => now()->subDays(2)]);

    $all = $this->postJson('/v1/admin/marketing-campaigns/audience-count', ['audience_type' => 'all'])->assertOk();
    expect($all->json('data.count'))->toBe(3); // opted-out excluded

    $ordered = $this->postJson('/v1/admin/marketing-campaigns/audience-count', ['audience_type' => 'ordered'])->assertOk();
    expect($ordered->json('data.count'))->toBe(2);

    $never = $this->postJson('/v1/admin/marketing-campaigns/audience-count', ['audience_type' => 'never_ordered'])->assertOk();
    expect($never->json('data.count'))->toBe(1);

    $activeCount = $this->postJson('/v1/admin/marketing-campaigns/audience-count', ['audience_type' => 'active'])->assertOk();
    expect($activeCount->json('data.count'))->toBe(1);

    $inactiveCount = $this->postJson('/v1/admin/marketing-campaigns/audience-count', ['audience_type' => 'inactive'])->assertOk();
    expect($inactiveCount->json('data.count'))->toBe(1);

    $manual = $this->postJson('/v1/admin/marketing-campaigns/audience-count', [
        'audience_type' => 'manual',
        'audience_client_ids' => [$active->id, $neverOrdered->id],
    ])->assertOk();
    expect($manual->json('data.count'))->toBe(2);
});

it('previews the exact rendered HTML including the unsubscribe link', function (): void {
    $campaign = MarketingCampaign::factory()->create(['content' => '<p>Contenu unique de test</p>']);
    $this->actingAs(admin());

    $response = $this->get('/v1/admin/marketing-campaigns/'.$campaign->id.'/preview');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/html')
        ->and($response->getContent())->toContain('Contenu unique de test')
        ->and($response->getContent())->toContain('désabonner');
});

it('sends a test e-mail only to the given address, never to real recipients', function (): void {
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    Client::factory()->count(3)->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send-test', ['test_email' => 'qa@sdcosmetique.ci'])
        ->assertOk()
        ->assertJsonPath('data.sent_to', 'qa@sdcosmetique.ci');

    Mail::assertSent(MarketingCampaignMail::class, fn (MarketingCampaignMail $mail): bool => true);
    Mail::assertSentCount(1);
    expect(MarketingCampaignRecipient::query()->count())->toBe(0);
    expect($campaign->fresh()->status)->toBe(CampaignStatus::Draft->value);
});

it('rejects a made-up test address whose domain cannot receive mail (§ anti-random check)', function (): void {
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send-test', ['test_email' => 'azerty@zzznotarealdomain12345.test'])
        ->assertStatus(422)
        ->assertJsonValidationErrors('test_email');

    Mail::assertNothingSent();
});

it('rejects a sender e-mail on a domain that cannot receive mail when creating a campaign', function (): void {
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns', draftCampaignPayload([
        'sender_email' => 'noreply@zzznotarealdomain12345.test',
    ]))->assertStatus(422)->assertJsonValidationErrors('sender_email');
});

it('dispatches one queued job per real recipient when sending for real (§7)', function (): void {
    Bus::fake();
    $campaign = MarketingCampaign::factory()->create();
    $subscribed = Client::factory()->count(3)->create(['marketing_opt_in' => true]);
    Client::factory()->create(['marketing_opt_in' => false]); // exclu (§9)

    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')
        ->assertOk()
        ->assertJsonPath('data.status', 'in_progress')
        ->assertJsonPath('data.recipients_count', 3);

    Bus::assertBatched(fn ($batch): bool => $batch->jobs->count() === 3);
    expect(MarketingCampaignRecipient::query()->where('campaign_id', $campaign->id)->count())->toBe(3);
});

it('never launches the same campaign twice on a double-click (§13)', function (): void {
    $campaign = MarketingCampaign::factory()->create();
    Client::factory()->count(2)->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')->assertOk();
    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')->assertStatus(409);

    // Une seule série de destinataires a été créée, pas deux.
    expect(MarketingCampaignRecipient::query()->where('campaign_id', $campaign->id)->count())->toBe(2);
});

it('actually delivers campaign e-mails and marks the campaign completed once the batch finishes', function (): void {
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    $client = Client::factory()->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')->assertOk();

    Mail::assertSent(MarketingCampaignMail::class, fn (MarketingCampaignMail $mail): bool => $mail->campaign->id === $campaign->id);

    $recipient = MarketingCampaignRecipient::query()->where('campaign_id', $campaign->id)->where('client_id', $client->id)->first();
    expect($recipient->status)->toBe(MarketingCampaignRecipient::STATUS_SENT)
        ->and($campaign->fresh()->status)->toBe(CampaignStatus::Completed->value)
        ->and($campaign->fresh()->sent_count)->toBe(1);
});

it('skips an unsubscribed client even if they were queued before unsubscribing (§9)', function (): void {
    Bus::fake();
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    $client = Client::factory()->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')->assertOk();

    // Le client se désabonne juste après la mise en file, avant l'exécution du job.
    $client->forceFill(['marketing_opt_in' => false])->save();

    $recipient = MarketingCampaignRecipient::query()->where('campaign_id', $campaign->id)->first();
    (new SendMarketingCampaignEmailJob($recipient->id))->handle();

    Mail::assertNotSent(MarketingCampaignMail::class);
    expect($recipient->fresh()->status)->toBe(MarketingCampaignRecipient::STATUS_SKIPPED_UNSUBSCRIBED);
});

it('unsubscribes a client through the signed link and stops future campaigns', function (): void {
    $client = Client::factory()->create(['marketing_opt_in' => true]);

    $url = URL::signedRoute('marketing.unsubscribe', ['client' => $client->id]);
    $this->get($url)->assertOk();

    expect($client->fresh()->marketing_opt_in)->toBeFalse();
});

it('rejects a tampered unsubscribe link', function (): void {
    $client = Client::factory()->create(['marketing_opt_in' => true]);

    $this->get('/marketing/unsubscribe/'.$client->id)->assertForbidden();

    expect($client->fresh()->marketing_opt_in)->toBeTrue();
});

it('duplicates a campaign as a fresh draft without recipients or stats (§8)', function (): void {
    $campaign = MarketingCampaign::factory()->completed()->create(['sent_count' => 10, 'recipients_count' => 10]);
    $this->actingAs(admin());

    $response = $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/duplicate')->assertCreated();

    expect($response->json('data.status'))->toBe('draft')
        ->and($response->json('data.sent_count'))->toBe(0)
        ->and($response->json('data.name'))->toContain('copie');
});

it('retries only the failed recipients, not the whole campaign (§8)', function (): void {
    Bus::fake();
    $campaign = MarketingCampaign::factory()->completed()->create(['recipients_count' => 2, 'sent_count' => 1, 'failed_count' => 1]);
    $sent = MarketingCampaignRecipient::factory()->for($campaign, 'campaign')->sent()->create();
    $failed = MarketingCampaignRecipient::factory()->for($campaign, 'campaign')->failed()->create();
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/retry-failed')->assertOk();

    Bus::assertBatched(fn ($batch): bool => $batch->jobs->count() === 1);
    expect($sent->fresh()->status)->toBe(MarketingCampaignRecipient::STATUS_SENT)
        ->and($failed->fresh()->status)->toBe(MarketingCampaignRecipient::STATUS_PENDING);
});

it('actually delivers a real mass campaign to a large audience, one e-mail per recipient (§7)', function (): void {
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    $recipients = Client::factory()->count(25)->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')
        ->assertOk()
        ->assertJsonPath('data.recipients_count', 25);

    Mail::assertSentCount(25);
    foreach ($recipients as $recipient) {
        Mail::assertSent(MarketingCampaignMail::class, function (MarketingCampaignMail $mail) use ($recipient): bool {
            return str_contains($mail->unsubscribeUrl, '/marketing/unsubscribe/'.$recipient->id);
        });
    }

    $fresh = $campaign->fresh();
    expect($fresh->status)->toBe(CampaignStatus::Completed->value)
        ->and($fresh->sent_count)->toBe(25)
        ->and($fresh->failed_count)->toBe(0)
        ->and(MarketingCampaignRecipient::query()->where('campaign_id', $campaign->id)->where('status', MarketingCampaignRecipient::STATUS_SENT)->count())->toBe(25);
});

it('cancels an in-progress campaign and never lets the finishing batch overwrite that status', function (): void {
    Bus::fake();
    $campaign = MarketingCampaign::factory()->create();
    Client::factory()->count(3)->create(['marketing_opt_in' => true]);
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/send')->assertOk();
    expect($campaign->fresh()->status)->toBe(CampaignStatus::InProgress->value);

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/cancel')
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled');

    expect($campaign->fresh()->status)->toBe(CampaignStatus::Cancelled->value);
});

it('skips a job outright once its real batch is marked cancelled, never sending that e-mail', function (): void {
    Mail::fake();
    $campaign = MarketingCampaign::factory()->create();
    $client = Client::factory()->create(['marketing_opt_in' => true]);
    $recipient = MarketingCampaignRecipient::factory()->for($campaign, 'campaign')->for($client)->create(['email' => $client->user->email]);

    $batchId = (string) Str::uuid();
    DB::table('job_batches')->insert([
        'id' => $batchId, 'name' => 'test-batch', 'total_jobs' => 1, 'pending_jobs' => 1,
        'failed_jobs' => 0, 'failed_job_ids' => '[]', 'options' => '[]',
        'cancelled_at' => now()->timestamp, 'created_at' => now()->timestamp, 'finished_at' => null,
    ]);

    $job = (new SendMarketingCampaignEmailJob($recipient->id))->withBatchId($batchId);
    $job->handle();

    Mail::assertNothingSent();
    expect($recipient->fresh()->status)->toBe(MarketingCampaignRecipient::STATUS_PENDING);
});

it('refuses to cancel a campaign that is not currently sending', function (): void {
    $campaign = MarketingCampaign::factory()->create(); // draft
    $this->actingAs(admin());

    $this->postJson('/v1/admin/marketing-campaigns/'.$campaign->id.'/cancel')->assertStatus(409);
});

it('refuses to delete a campaign that is currently sending', function (): void {
    $campaign = MarketingCampaign::factory()->create(['status' => CampaignStatus::InProgress->value]);
    $this->actingAs(admin());

    $this->deleteJson('/v1/admin/marketing-campaigns/'.$campaign->id)->assertStatus(409);
});

it('deletes a draft campaign', function (): void {
    $campaign = MarketingCampaign::factory()->create();
    $this->actingAs(admin());

    $this->deleteJson('/v1/admin/marketing-campaigns/'.$campaign->id)->assertNoContent();
    expect(MarketingCampaign::find($campaign->id))->toBeNull();
});
