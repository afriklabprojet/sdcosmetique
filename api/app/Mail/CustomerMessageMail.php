<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\Messaging\Models\CustomerMessage;
use App\Shared\Branding\ShopProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** Envoyée depuis un job déjà mis en file (`SendCustomerMessageJob`). */
class CustomerMessageMail extends Mailable
{
    use Queueable;

    public function __construct(public readonly CustomerMessage $customerMessage) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->customerMessage->subject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer-message',
            with: [
                'bodyHtml' => $this->customerMessage->body,
                'shop' => ShopProfile::current(),
            ],
        );
    }
}
