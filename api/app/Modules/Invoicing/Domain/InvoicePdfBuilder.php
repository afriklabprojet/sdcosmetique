<?php

declare(strict_types=1);

namespace App\Modules\Invoicing\Domain;

use App\Modules\Invoicing\Models\Invoice;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Models\Order;
use App\Modules\Settings\Models\Setting;
use Barryvdh\DomPDF\Facade\Pdf;
use Barryvdh\DomPDF\PDF as DomPdf;

/**
 * Construit le PDF de facture/reçu à partir d'une commande — toutes les
 * données (client, produits, prix, paiement, livraison) viennent de la
 * commande elle-même ; seules les informations de la boutique viennent des
 * réglages « Détails de la facture ». Rendu à la volée à chaque appel (pas de
 * fichier persistant) : la commande est déjà un instantané immuable, inutile
 * de dupliquer son contenu sur disque.
 */
class InvoicePdfBuilder
{
    private const array PAYMENT_LABELS = [
        'orange_money' => 'Orange Money',
        'wave' => 'Wave',
        'mtn_momo' => 'MTN MoMo',
        'moov_money' => 'Moov Money',
        'djamo' => 'Djamo',
        'jeko' => 'Jeko',
        'null' => 'Non spécifié',
    ];

    private const array ORDER_STATUS_LABELS = [
        'draft' => 'Brouillon',
        'placed' => 'Confirmée',
        'paid' => 'Payée',
        'shipped' => 'Expédiée',
        'delivered' => 'Livrée',
        'cancelled' => 'Annulée',
    ];

    private const array COUNTRY_LABELS = [
        'CI' => "Côte d'Ivoire",
        'FR' => 'France',
        'SN' => 'Sénégal',
        'ML' => 'Mali',
        'BF' => 'Burkina Faso',
        'GN' => 'Guinée',
    ];

    /**
     * "15 000 FCFA" — jamais "15000FCFA". Espace insécable comme séparateur
     * de milliers pour qu'il ne se coupe jamais en fin de ligne dans le PDF.
     */
    public static function formatMoney(int $amount): string
    {
        return number_format($amount, 0, ',', "\u{00A0}").' FCFA';
    }

    public function render(Order $order): DomPdf
    {
        $invoice = Invoice::forOrder($order);
        $order->loadMissing(['items', 'adjustments', 'deliveryMethod', 'client.user']);

        $data = $this->data($order, $invoice);

        return Pdf::loadView('pdf.invoice', $data)->setPaper('a4', 'portrait');
    }

    /**
     * @return array<string, mixed>
     */
    private function data(Order $order, Invoice $invoice): array
    {
        $shop = Setting::query()->where('key', 'invoice_details')->value('value') ?? [];

        $destination = is_array($order->destination) ? $order->destination : [];
        $shippingAdjustment = $order->adjustments->firstWhere('type', AdjustmentType::Shipping);
        $discountAdjustments = $order->adjustments->filter(
            fn ($adjustment): bool => in_array($adjustment->type, [AdjustmentType::Discount, AdjustmentType::ShippingDiscount], true),
        );
        $discountTotal = (int) $discountAdjustments->sum(fn ($adjustment) => $adjustment->amount->value);
        $shippingCost = $shippingAdjustment !== null
            ? $shippingAdjustment->amount->value
            : (int) ($order->deliveryMethod?->amount->value ?? 0);

        $paidAmount = $order->paid_at !== null ? $order->total->value : 0;
        $dueAmount = max(0, $order->total->value - $paidAmount);

        return [
            'shop' => [
                'logoUrl' => $shop['logoUrl'] ?? null,
                'businessName' => $shop['businessName'] ?? 'SD Cosmétique',
                'legalName' => $shop['legalName'] ?? '',
                'phone' => $shop['phone'] ?? '',
                'phoneSecondary' => $shop['phoneSecondary'] ?? '',
                'whatsapp' => $shop['whatsapp'] ?? '',
                'email' => $shop['email'] ?? '',
                'website' => $shop['website'] ?? '',
                'address' => $shop['address'] ?? '',
                'city' => $shop['city'] ?? '',
                'country' => $shop['country'] ?? '',
                'rccm' => $shop['rccm'] ?? '',
                'taxId' => $shop['taxId'] ?? '',
                'footerText' => $shop['footerText'] ?? '',
                'terms' => $shop['terms'] ?? '',
                'thankYouMessage' => $shop['thankYouMessage'] ?? '',
            ],
            'invoice' => [
                'number' => $invoice->number,
                'issuedAt' => $invoice->issued_at,
            ],
            'order' => [
                'reference' => $order->reference,
                'placedAt' => $order->placed_at,
                'paymentMethod' => self::PAYMENT_LABELS[$order->gateway ?? 'null'] ?? ucfirst((string) $order->gateway),
                'paymentStatus' => match (true) {
                    $order->refunded_at !== null => 'Remboursée',
                    $order->paid_at !== null => 'Payée',
                    default => 'En attente de paiement',
                },
                'orderStatus' => self::ORDER_STATUS_LABELS[$order->status()->value] ?? $order->status()->value,
            ],
            'client' => [
                'name' => trim(($destination['first_name'] ?? '').' '.($destination['last_name'] ?? '')) ?: ($order->client?->user?->name ?? ''),
                'phone' => $destination['phone'] ?? $order->client?->phone ?? '',
                'email' => $order->email ?? $order->client?->user?->email ?? '',
                'address' => trim(($destination['line_1'] ?? '').' '.($destination['line_2'] ?? '')),
                'city' => $destination['city'] ?? '',
                'country' => self::COUNTRY_LABELS[$destination['country'] ?? ''] ?? ($destination['country'] ?? ''),
            ],
            'items' => $order->items->map(fn ($item): array => [
                'title' => $item->title,
                'variant' => $item->label,
                'quantity' => $item->quantity,
                'unitPrice' => $item->unit_price->value,
                'total' => $item->total->value,
            ])->values()->all(),
            'totals' => [
                'subtotal' => $order->subtotal->value,
                'discount' => $discountTotal,
                'shipping' => $shippingCost,
                'total' => $order->total->value,
                'paid' => $paidAmount,
                'due' => $dueAmount,
            ],
        ];
    }
}
