<?php

declare(strict_types=1);

namespace App\Mail;

use App\Modules\Orders\Models\Order;
use App\Shared\Branding\ShopProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Envoyée depuis un job déjà mis en file (`SendOrderInvoiceEmailJob`) — pas
 * de `ShouldQueue` ici, ce serait une double mise en file inutile.
 */
class OrderConfirmationMail extends Mailable
{
    use Queueable;

    public function __construct(
        public readonly Order $order,
        public readonly string $invoiceNumber,
        public readonly string $pdfContent,
        public readonly string $pdfFilename,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmation de votre commande #'.$this->order->reference.' – SD COSMETIQUE',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmation',
            with: [
                'reference' => $this->order->reference,
                'invoiceNumber' => $this->invoiceNumber,
                'firstName' => is_array($this->order->destination) ? ($this->order->destination['first_name'] ?? null) : null,
                'total' => $this->order->total->value,
                'siteUrl' => rtrim((string) config('app.frontend_url'), '/'),
                'shop' => ShopProfile::current(),
            ],
        );
    }

    /**
     * @return list<Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn (): string => $this->pdfContent, $this->pdfFilename)
                ->withMime('application/pdf'),
        ];
    }
}
