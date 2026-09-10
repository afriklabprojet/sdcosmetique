<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\Messaging\Models\MarketingCampaign;
use App\Shared\Branding\ShopProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Envoyée depuis un job déjà mis en file (`SendMarketingCampaignEmailJob`).
 * Toujours accompagnée d'un lien de désabonnement (§9) — contrairement aux
 * e-mails transactionnels (`OrderConfirmationMail`, `CustomerMessageMail`),
 * qui en sont exempts.
 */
class MarketingCampaignMail extends Mailable
{
    use Queueable;

    public function __construct(
        public readonly MarketingCampaign $campaign,
        public readonly string $unsubscribeUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address($this->campaign->sender_email, $this->campaign->sender_name),
            subject: $this->campaign->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.marketing-campaign',
            with: [
                'bodyHtml' => $this->campaign->content,
                'unsubscribeUrl' => $this->unsubscribeUrl,
                'shop' => ShopProfile::current(),
            ],
        );
    }
}
