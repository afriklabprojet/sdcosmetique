<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Envoyé de manière synchrone (pas de ShouldQueue) : un code de connexion
 * doit arriver immédiatement, pas attendre un worker de file d'attente.
 */
class OtpLoginMail extends Mailable
{
    use Queueable;

    public function __construct(
        public readonly User $user,
        public readonly string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre code de connexion SD Cosmétique',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp-login',
            with: [
                'name' => $this->user->name,
                'code' => $this->code,
            ],
        );
    }
}
