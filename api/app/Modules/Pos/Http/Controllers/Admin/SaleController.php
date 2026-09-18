<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Orders\Models\Order;
use App\Modules\Pos\Domain\PosRefund;
use App\Modules\Pos\Domain\PosSale;
use App\Modules\Pos\Enums\PosTenderMethod;
use App\Modules\Pos\Http\Requests\Admin\CreatePosSaleRequest;
use App\Modules\Pos\Http\Requests\Admin\RefundPosSaleRequest;
use App\Modules\Pos\Http\Resources\Admin\PosSaleResource;
use App\Modules\Pos\Models\AuditLog;
use App\Modules\Pos\Models\CashRegisterSession;
use App\Modules\Pos\Queries\PosSaleIndex;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(
        private readonly PosSale $posSale,
        private readonly PosRefund $posRefund,
        private readonly PosSaleIndex $salesIndex,
    ) {}

    /** Historique des ventes (§20), filtrable — vendeur, caisse, client, moyen de paiement, statut, référence. */
    public function index(Request $request): JsonResponse
    {
        $sales = $this->salesIndex->filtered($request)->paginate(min((int) $request->integer('perPage', 30), 100));

        return PosSaleResource::collection($sales)->response();
    }

    public function store(CreatePosSaleRequest $request): JsonResponse
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);

        $session = CashRegisterSession::query()->findOrFail($request->validated('cash_register_session_id'));
        // Enregistrer une vente dans la session d'un autre vendeur est réservé aux paliers Manager/SuperAdmin (VULN-02).
        abort_unless($session->admin_id === $admin->id || $admin->tier() !== AdminRole::Cashier, 403);

        try {
            $order = $this->posSale->create(
                session: $session,
                cashier: $admin,
                items: $request->validated('items'),
                tenders: $request->validated('tenders'),
                clientId: $request->validated('client_id'),
                email: $request->validated('email'),
                customerName: $request->validated('customer_name'),
                customerPhone: $request->validated('customer_phone'),
                discount: $request->validated('discount'),
                notes: $request->validated('notes'),
                idempotencyKey: $request->validated('idempotency_key'),
                request: $request,
            );
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        return PosSaleResource::make($order)->response()->setStatusCode(201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->pos(), 404);
        $this->authorizeRead($request, $order);

        return PosSaleResource::make($order)->response();
    }

    /** Remboursement total ou partiel par ligne (§21) — réservé aux managers et administrateurs. */
    public function refund(RefundPosSaleRequest $request, Order $order): JsonResponse
    {
        abort_unless($order->pos(), 404);

        $admin = $request->user()?->admin;
        abort_unless($admin !== null && $admin->tier() !== AdminRole::Cashier, 403);

        try {
            $this->posRefund->refund(
                order: $order,
                reason: $request->validated('reason'),
                method: PosTenderMethod::from($request->validated('method')),
                admin: $admin,
                by: $request->user(),
                items: $request->validated('items'),
                request: $request,
            );
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        return PosSaleResource::make($order->refresh())->response();
    }

    /** Annule une vente en attente (ex. paiement Jeko abandonné par le client) — restaure le stock, jamais utilisable sur une vente déjà réglée. */
    public function destroy(Request $request, Order $order): JsonResponse
    {
        abort_unless($order->pos(), 404);

        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);
        abort_unless($order->served_by === $admin->id || $admin->tier() !== AdminRole::Cashier, 403);

        abort_if($order->paid_at !== null, 422, 'Cette vente est déjà payée — utilisez le remboursement.');
        abort_if($order->cancelled_at !== null, 422, 'Cette vente est déjà annulée.');

        $order->cancel('Vente annulée par le vendeur.');

        AuditLog::record(AuditLog::SALE_CANCELLED, $order, $request->user(), new_values: [
            'reference' => $order->reference,
        ], request: $request);

        return response()->json(['data' => ['status' => 'cancelled']]);
    }

    private function authorizeRead(Request $request, Order $order): void
    {
        $admin = $request->user()?->admin;
        abort_unless($admin !== null, 403);
        abort_unless($order->served_by === $admin->id || $admin->tier() !== AdminRole::Cashier, 404);
    }
}
