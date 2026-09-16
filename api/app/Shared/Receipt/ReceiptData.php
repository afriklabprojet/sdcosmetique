<?php

declare(strict_types=1);

namespace App\Shared\Receipt;

use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment;
use App\Modules\Pos\Domain\PosRefund;
use App\Modules\Pos\Enums\PosTenderMethod;
use App\Modules\Pos\Models\CashRegisterSession;
use App\Shared\Branding\ShopProfile;
use Illuminate\Support\Facades\URL;

/**
 * Point d'entrée unique du « Receipt Engine » (§34) : une vente POS et une
 * commande web sont deux variantes de la même donnée. Le JSON produit ici est
 * consommé tel quel par l'aperçu web, le PDF (thermique/A4) et l'export
 * partagé — modifier un montant ou une règle d'affichage se fait une seule
 * fois, ici.
 */
final class ReceiptData
{
    private const array WEB_TENDER_LABELS = [
        'orange_money' => 'Orange Money',
        'wave' => 'Wave',
        'mtn_momo' => 'MTN MoMo',
        'moov_money' => 'Moov Money',
        'djamo' => 'Djamo',
        'cash_on_delivery' => 'Paiement à la livraison',
    ];

    /**
     * @return array<string, mixed>
     */
    public static function build(Order $order): array
    {
        $order->loadMissing(['items', 'adjustments', 'client.user']);

        $isPos = $order->pos();

        $discount = (int) $order->adjustments
            ->whereIn('type', [AdjustmentType::Discount, AdjustmentType::ShippingDiscount])
            ->sum(fn ($adjustment) => $adjustment->amount->value);

        $payments = self::payments($order);
        $change = (int) collect($payments)->sum('change');
        $receiptUrl = self::frontendReceiptUrl($order);
        $pdfUrl = URL::signedRoute('orders.receipt.pdf', ['order' => $order->reference]);

        return [
            'sale_number' => $order->reference,
            'channel' => $isPos ? 'pos' : 'web',
            'date' => $order->placed_at?->format('d/m/Y'),
            'time' => $order->placed_at?->format('H:i'),
            'placed_at' => $order->placed_at?->toIso8601String(),
            'merchant' => self::merchant(),
            'cashier' => $isPos ? self::cashier($order) : null,
            'register' => $isPos ? self::register($order) : null,
            'customer' => self::customer($order),
            'items' => $order->items->map(fn ($item): array => [
                'title' => $item->title,
                'label' => $item->label,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price->value,
                'total' => $item->total->value,
            ])->values()->all(),
            'subtotal' => $order->subtotal->value,
            'discount' => $discount,
            'tax' => 0,
            'total' => $order->total->value,
            'currency' => $order->currency,
            'payments' => $payments,
            'change' => $change,
            'status' => self::status($order, $isPos),
            'qr_image' => ReceiptQrCode::dataUri($receiptUrl),
            'receipt_url' => $receiptUrl,
            'pdf_url' => $pdfUrl,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private static function merchant(): array
    {
        $shop = ShopProfile::current();

        return [
            'name' => $shop['businessName'],
            'logo' => $shop['logoUrl'],
            'phone' => $shop['phone'],
            'address' => trim($shop['address'].(($shop['city'] ?? '') !== '' ? ', '.$shop['city'] : '')),
            'website' => $shop['website'],
            'whatsapp' => $shop['whatsapp'],
            'footer_text' => $shop['footerText'],
            'thank_you_message' => $shop['thankYouMessage'],
        ];
    }

    /**
     * @return array{name: string}|null
     */
    private static function cashier(Order $order): ?array
    {
        if ($order->served_by === null) {
            return null;
        }

        $admin = Admin::query()->with('user')->find($order->served_by);

        return $admin?->user?->name !== null ? ['name' => $admin->user->name] : null;
    }

    /**
     * @return array{name: string}|null
     */
    private static function register(Order $order): ?array
    {
        if ($order->cash_register_session_id === null) {
            return null;
        }

        $session = CashRegisterSession::query()->with('cashRegister')->find($order->cash_register_session_id);

        return $session?->cashRegister?->name !== null ? ['name' => $session->cashRegister->name] : null;
    }

    /**
     * @return array{name: string, phone: ?string}|null
     */
    private static function customer(Order $order): ?array
    {
        $name = $order->client?->user?->name ?? ($order->destination['first_name'] ?? null);
        $phone = $order->client?->phone ?? ($order->destination['phone'] ?? null);

        if ($name === null || trim((string) $name) === '') {
            return null;
        }

        return ['name' => $name, 'phone' => $phone];
    }

    /**
     * @return list<array{method: string, label: string, amount: int, received: ?int, change: int}>
     */
    private static function payments(Order $order): array
    {
        return Payment::query()
            ->where('order_id', $order->id)
            ->with('attempts')
            ->get()
            ->flatMap(fn (Payment $payment) => $payment->attempts->map(function ($attempt): array {
                $gateway = (string) $attempt->gateway;
                $method = str_starts_with($gateway, 'pos_') ? substr($gateway, 4) : $gateway;
                $received = $attempt->received_amount?->value;

                return [
                    'method' => $method,
                    'label' => self::tenderLabel($method),
                    'amount' => $attempt->amount->value,
                    'received' => $received,
                    'change' => $received !== null ? max(0, $received - $attempt->amount->value) : 0,
                ];
            }))
            ->values()
            ->all();
    }

    private static function tenderLabel(string $method): string
    {
        $posMethod = PosTenderMethod::tryFrom($method);

        return $posMethod?->label() ?? self::WEB_TENDER_LABELS[$method] ?? ucfirst(str_replace('_', ' ', $method));
    }

    private static function status(Order $order, bool $isPos): string
    {
        if ($order->cancelled_at !== null) {
            return 'cancelled';
        }

        if ($isPos) {
            return match ((new PosRefund)->refundStatus($order)) {
                'full' => 'refunded',
                'partial' => 'partial_refund',
                default => $order->paid_at !== null ? 'paid' : 'pending',
            };
        }

        if ($order->refunded_at !== null) {
            return 'refunded';
        }

        return $order->paid_at !== null ? 'paid' : 'pending';
    }

    /**
     * URL publique du reçu (§14) — signée (Laravel URL signing), jamais liée
     * à une donnée personnelle du client : fonctionne pour toute vente,
     * compte lié ou non, sans exposer l'e-mail dans le QR. La page Next.js
     * `/recu/{reference}` réutilise telle quelle la signature générée ici
     * pour interroger l'API.
     */
    private static function frontendReceiptUrl(Order $order): string
    {
        $signedApiUrl = URL::signedRoute('orders.receipt.show', ['order' => $order->reference]);
        $query = parse_url($signedApiUrl, PHP_URL_QUERY);
        $base = rtrim((string) config('app.frontend_url'), '/');

        return $base.'/recu/'.$order->reference.'?'.$query;
    }
}
