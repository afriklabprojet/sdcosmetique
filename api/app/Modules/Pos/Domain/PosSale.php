<?php

declare(strict_types=1);

namespace App\Modules\Pos\Domain;

use App\Modules\Catalog\Models\Product;
use App\Modules\Identity\Models\Admin;
use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Domain\Terminals;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Pos\Enums\PosTenderMethod;
use App\Modules\Pos\Models\AuditLog;
use App\Modules\Pos\Models\CashRegisterSession;
use App\Shared\Money;
use DomainException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Orchestre la création d'une vente en caisse — équivalent du `Checkout`
 * existant (tunnel web), mais sans panier ni livraison : les lignes, la
 * remise et les règlements arrivent en un seul appel depuis l'écran de
 * caisse. Réutilise directement `Product::take()` (décrément atomique du
 * stock), `Order::adjust()`/`recalculate()`/`pay()` et `Payment`/`Attempt`
 * (paiement multiple) — aucun nouveau mécanisme de prix, de stock ou de
 * paiement n'est introduit.
 */
class PosSale
{
    public function __construct(
        private readonly Terminals $terminals,
        private readonly DiscountPolicy $discountPolicy = new DiscountPolicy,
    ) {}

    /**
     * @param  array<int, array{product_id: int, quantity: int}>  $items
     * @param  array{type: string, value: int}|null  $discount
     * @param  array<int, array{method: string, amount: int, received?: int}>  $tenders
     */
    public function create(
        CashRegisterSession $session,
        Admin $cashier,
        array $items,
        array $tenders,
        ?int $clientId = null,
        ?string $email = null,
        ?string $customerName = null,
        ?string $customerPhone = null,
        ?array $discount = null,
        ?string $notes = null,
        ?string $idempotencyKey = null,
        ?Request $request = null,
    ): Order {
        if (! $session->open()) {
            throw new DomainException('La session de caisse est fermée.');
        }

        if ($idempotencyKey !== null) {
            $existing = Order::query()->where('idempotency_key', $idempotencyKey)->first();

            if ($existing !== null) {
                if (! $existing->pos()
                    || $existing->cash_register_session_id !== $session->id
                    || $existing->served_by !== $cashier->id) {
                    throw new DomainException('Cette clé d’idempotence appartient à une autre vente.');
                }

                return $existing;
            }
        }

        return DB::transaction(function () use (
            $session, $cashier, $items, $tenders, $clientId, $email,
            $customerName, $customerPhone, $discount, $notes, $idempotencyKey, $request,
        ): Order {
            $order = Order::query()->create([
                'client_id' => $clientId,
                'email' => $email,
                'gateway' => 'pos',
                'channel' => 'pos',
                'cash_register_session_id' => $session->id,
                'served_by' => $cashier->id,
                'currency' => 'XOF',
                'subtotal' => 0,
                'total' => 0,
                'destination' => ($customerName !== null || $customerPhone !== null)
                    ? ['first_name' => $customerName, 'phone' => $customerPhone]
                    : null,
                'note' => $notes,
                'idempotency_key' => $idempotencyKey,
            ]);

            foreach ($items as $line) {
                $this->addLine($order, (int) $line['product_id'], (int) $line['quantity']);
            }

            if ($discount !== null && (int) $discount['value'] > 0) {
                $this->applyDiscount($order, $discount, $cashier, $request);
            }

            $order->recalculate();

            $total = (int) $order->total->value;
            $tendered = array_sum(array_column($tenders, 'amount'));

            if ($tendered !== $total) {
                throw new DomainException('Le total des paiements ('.$tendered.') ne correspond pas au total de la vente ('.$total.').');
            }

            $order->forceFill([
                'reference' => Order::nextStructuredReference(),
                'placed_at' => now(),
            ])->save();

            $payment = Payment::start($order, new Money($total));

            foreach ($tenders as $tender) {
                $method = PosTenderMethod::from($tender['method']);
                $received = isset($tender['received']) ? (int) $tender['received'] : null;

                if ($received !== null && $received < (int) $tender['amount']) {
                    throw new DomainException('Le montant reçu ne peut pas être inférieur au montant réglé.');
                }

                $attempt = $payment->attempts()->create([
                    'gateway' => $method->gateway(),
                    'reference' => 'POS-'.Str::upper(Str::random(10)),
                    'amount' => (int) $tender['amount'],
                    'received_amount' => $received,
                    'currency' => 'XOF',
                    'initiated_at' => now(),
                    'confirmed_at' => $method === PosTenderMethod::Jeko ? null : now(),
                ]);

                // Jeko (§ paiement réel) : demande un vrai lien de paiement
                // que le client scanne sur son téléphone — la confirmation
                // n'arrive que plus tard par webhook (voir
                // `Payment\Notification::settle()`), jamais ici.
                if ($method === PosTenderMethod::Jeko) {
                    $attempt = $attempt->start($this->terminals->get('jeko'), $order);

                    if ($attempt->failed_at !== null) {
                        throw new DomainException(
                            'Le paiement Jeko n\'a pas pu être initié : '.($attempt->failure_reason ?? 'erreur inconnue'),
                        );
                    }
                }
            }

            // Un ou plusieurs tenders Jeko restent en attente de webhook —
            // ne pas régler le paiement/la commande maintenant. `settle()`
            // (webhook) s'en charge une fois TOUTES les tentatives réglées
            // (`Payment::fullySettled()`), y compris pour un règlement
            // fractionné où une partie (espèces) est déjà confirmée.
            if ($payment->fullySettled()) {
                $payment->confirm();

                $order->pay(new Settlement(
                    gateway: 'pos',
                    reference: $order->reference,
                    amount: $total,
                    currency: 'XOF',
                ));

                // Client de passage avec e-mail renseigné : crée (ou retrouve)
                // un compte automatiquement, exactement comme pour une
                // commande web (§6 — "nouveau client"). Réutilise
                // `ClientLinker`, déjà éprouvé par le tunnel de paiement en
                // ligne — aucune nouvelle logique de création de compte
                // n'est introduite pour la caisse.
                if ($order->client_id === null && $order->email !== null && trim($order->email) !== '') {
                    $order->linker()->attach();
                    $order->refresh();
                }
            }

            AuditLog::record(AuditLog::SALE_CREATED, $order, $cashier->user, new_values: [
                'reference' => $order->reference,
                'total' => $total,
                'items' => count($items),
            ], request: $request);

            AuditLog::record(AuditLog::PAYMENT_CREATED, $payment, $cashier->user, new_values: [
                'amount' => $total,
                'tenders' => $tenders,
            ], request: $request);

            return $order->refresh()->load(['items', 'adjustments']);
        });
    }

    private function addLine(Order $order, int $productId, int $quantity): void
    {
        if ($quantity < 1) {
            throw new DomainException('La quantité doit être au moins 1.');
        }

        $product = Product::query()->findOrFail($productId);

        if (! $product->sellable()) {
            throw new DomainException("Le produit « {$product->title} » n'est pas vendable directement (sélectionnez une variante).");
        }

        try {
            $product->take($quantity);
        } catch (DomainException) {
            throw new DomainException("Stock insuffisant pour « {$product->title} ».");
        }

        $unitPrice = $product->pricing()->unit();

        $order->items()->create([
            'product_id' => $product->id,
            'title' => $product->parent?->title ?? $product->title,
            'label' => $product->label,
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'total' => $unitPrice * $quantity,
        ]);
    }

    /**
     * @param  array{type: string, value: int}  $discount
     */
    private function applyDiscount(Order $order, array $discount, Admin $cashier, ?Request $request): void
    {
        $subtotal = (int) $order->items()->sum('total');
        $amount = $discount['type'] === 'percent'
            ? (int) round($subtotal * ((int) $discount['value']) / 100)
            : (int) $discount['value'];

        $amount = min($amount, $subtotal);

        if (! $this->discountPolicy->allows($cashier, $amount, $subtotal)) {
            throw new DomainException('Cette remise dépasse le plafond autorisé pour votre rôle.');
        }

        $label = $discount['type'] === 'percent' ? $discount['value'].'%' : 'Remise caisse';
        $order->adjust(AdjustmentType::Discount, new Money($amount), $label);

        AuditLog::record(AuditLog::DISCOUNT_APPLIED, $order, $cashier->user, new_values: [
            'type' => $discount['type'],
            'value' => $discount['value'],
            'amount' => $amount,
        ], request: $request);
    }
}
