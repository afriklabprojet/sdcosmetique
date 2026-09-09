<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AccountReadyMail extends Mailable
{
    use Queueable;

    public function __construct(
        public readonly User $user,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre espace client SD Cosmétique est disponible',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.account-ready',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'siteUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
