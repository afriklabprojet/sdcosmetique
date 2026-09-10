<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\MarketingCampaignMail;
use App\Modules\Messaging\Models\MarketingCampaign;
use App\Modules\Messaging\Models\MarketingCampaignRecipient;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Throwable;

/**
 * Envoie un e-mail de campagne à UN destinataire — un job par destinataire,
 * regroupés dans un `Bus::batch()` (§7) plutôt qu'une boucle d'envoi
 * synchrone : jamais d'envoi de masse dans une seule requête HTTP. Chaque
 * job re-vérifie l'opt-in marketing au moment de l'envoi (pas seulement à la
 * constitution de la liste) au cas où le client se serait désabonné entre
 * la création de la campagne et le passage de son tour dans la file.
 */
class SendMarketingCampaignEmailJob implements ShouldQueue
{
    use Batchable, Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public function __construct(public readonly int $recipientId) {}

    public function handle(): void
    {
        if ($this->batch()?->cancelled()) {
            return;
        }

        $recipient = MarketingCampaignRecipient::with(['campaign', 'client'])->find($this->recipientId);

        if ($recipient === null) {
            return;
        }

        if ($recipient->client?->marketing_opt_in !== true) {
            $recipient->forceFill(['status' => MarketingCampaignRecipient::STATUS_SKIPPED_UNSUBSCRIBED])->save();

            return;
        }

        $unsubscribeUrl = URL::signedRoute('marketing.unsubscribe', ['client' => $recipient->client_id]);

        Mail::to($recipient->email)->send(new MarketingCampaignMail($recipient->campaign, $unsubscribeUrl));

        $recipient->forceFill(['status' => MarketingCampaignRecipient::STATUS_SENT, 'sent_at' => now(), 'error' => null])->save();

        MarketingCampaign::query()->where('id', $recipient->campaign_id)->increment('sent_count');
    }

    public function failed(?Throwable $exception): void
    {
        $recipient = MarketingCampaignRecipient::find($this->recipientId);

        if ($recipient === null) {
            return;
        }

        $recipient->forceFill(['status' => MarketingCampaignRecipient::STATUS_FAILED, 'error' => $exception?->getMessage()])->save();

        MarketingCampaign::query()->where('id', $recipient->campaign_id)->increment('failed_count');
    }
}
