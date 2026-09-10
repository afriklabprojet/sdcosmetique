<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\CustomerMessageMail;
use App\Modules\Messaging\Models\CustomerMessage;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Envoie un message individuel admin → client (§5/§10). En file pour ne
 * jamais bloquer la réponse de l'admin — même job pour un premier envoi et
 * un « Renvoyer » (§11), qui ne fait que repasser le même enregistrement ici
 * après l'avoir remis en statut "pending".
 */
class SendCustomerMessageJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public function __construct(public readonly int $messageId) {}

    public function handle(): void
    {
        $message = CustomerMessage::find($this->messageId);

        if ($message === null) {
            return;
        }

        Mail::to($message->recipient_email)->send(new CustomerMessageMail($message));

        $message->forceFill([
            'status' => CustomerMessage::STATUS_SENT,
            'sent_at' => now(),
            'error' => null,
        ])->save();
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('SendCustomerMessageJob failed.', [
            'message_id' => $this->messageId,
            'error' => $exception?->getMessage(),
        ]);

        CustomerMessage::query()->where('id', $this->messageId)->update([
            'status' => CustomerMessage::STATUS_FAILED,
            'error' => $exception?->getMessage(),
        ]);
    }
}
