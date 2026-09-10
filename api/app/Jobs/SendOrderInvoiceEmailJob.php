<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Mail\OrderConfirmationMail;
use App\Modules\Invoicing\Domain\InvoicePdfBuilder;
use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Génère (ou réutilise) la facture d'une commande et envoie l'e-mail de
 * confirmation avec le PDF en pièce jointe. En file d'attente pour ne jamais
 * ralentir la validation d'une commande ni la réponse d'un admin qui clique
 * sur « Envoyer par e-mail » / « Renvoyer le reçu » — c'est le même job pour
 * les deux, un renvoi manuel n'est qu'un nouveau passage ici.
 */
class SendOrderInvoiceEmailJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var list<int> */
    public array $backoff = [30, 120, 300];

    public function __construct(public readonly int $orderId) {}

    public function handle(InvoicePdfBuilder $builder): void
    {
        $order = Order::find($this->orderId);

        if ($order === null) {
            return;
        }

        $invoice = Invoice::forOrder($order);
        $recipient = $order->email ?: $order->client?->user?->email;

        if ($recipient === null || $recipient === '') {
            $invoice->forceFill([
                'email_status' => Invoice::STATUS_FAILED,
                'email_error' => "Aucune adresse e-mail n'est associée à cette commande.",
            ])->save();

            return;
        }

        $pdfContent = $builder->render($order)->output();
        $filename = 'Facture-SD-COSMETIQUE-'.$invoice->number.'.pdf';

        Mail::to($recipient)->send(new OrderConfirmationMail($order, $invoice->number, $pdfContent, $filename));

        $invoice->forceFill([
            'email_status' => Invoice::STATUS_SENT,
            'email_sent_at' => now(),
            'email_error' => null,
        ])->save();
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('SendOrderInvoiceEmailJob failed.', [
            'order_id' => $this->orderId,
            'error' => $exception?->getMessage(),
        ]);

        Invoice::query()->where('order_id', $this->orderId)->update([
            'email_status' => Invoice::STATUS_FAILED,
            'email_error' => $exception?->getMessage(),
        ]);
    }
}
