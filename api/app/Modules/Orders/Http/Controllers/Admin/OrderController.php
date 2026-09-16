<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Orders\Http\Requests\Admin\StoreAdjustmentRequest;
use App\Modules\Orders\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Modules\Orders\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use App\Shared\Money;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::query()
            ->whereNotNull('placed_at')
            ->with(['items', 'adjustments', 'deliveryMethod'])
            ->latest('placed_at')
            ->paginate(min((int) $request->integer('perPage', 30), 100));

        return OrderResource::collection($orders)->response();
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return OrderResource::make($order)->response();
    }

    public function update(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);
        $this->rejectPosMutation($order);

        $status = OrderStatus::from($request->validated('status'));

        try {
            match ($status) {
                OrderStatus::Paid => $order->pay(new Settlement(
                    gateway: $order->gateway ?? 'manual',
                    reference: 'manual-'.$order->reference,
                    amount: $order->total->value,
                    currency: $order->currency,
                )),
                OrderStatus::Shipped => $order->ship(),
                OrderStatus::Delivered => $order->deliver(),
                OrderStatus::Cancelled => $order->cancel((string) $request->validated('reason', '')),
                OrderStatus::Refunded => $order->refund(),
                default => abort(422, 'Cannot transition to '.$status->value),
            };
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        return OrderResource::make($order->refresh())->response();
    }

    public function storeAdjustment(StoreAdjustmentRequest $request, Order $order): JsonResponse
    {
        $this->authorize('update', $order);
        $this->rejectPosMutation($order);

        try {
            $order->adjust(
                AdjustmentType::from($request->validated('type')),
                new Money((int) $request->validated('amount'), $order->currency),
                $request->validated('label'),
            );
            $order->recalculate();
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        return OrderResource::make($order->refresh())->response();
    }

    public function destroy(Order $order): Response
    {
        $this->authorize('delete', $order);
        $this->rejectPosMutation($order);

        try {
            $order->discard();
        } catch (DomainException $e) {
            abort(422, $e->getMessage());
        }

        return response()->noContent();
    }

    /**
     * Supprime en une fois toutes les commandes jamais payées — l'action du
     * widget « Non payées » du tableau de bord, pour ne pas faire boucler le
     * front sur une suppression par commande.
     */
    public function destroyUnpaid(Request $request): JsonResponse
    {
        abort_unless((bool) $request->user()?->administrator(), 403);

        $orders = Order::query()
            ->whereNotNull('placed_at')
            ->whereNull('paid_at')
            ->where(fn ($query) => $query
                ->whereNull('channel')
                ->orWhere('channel', '!=', 'pos'))
            ->get();

        DB::transaction(function () use ($orders): void {
            foreach ($orders as $order) {
                $order->discard();
            }
        });

        return response()->json(['deleted' => $orders->count()]);
    }

    private function rejectPosMutation(Order $order): void
    {
        abort_if(
            $order->pos(),
            422,
            'Une vente caisse se modifie uniquement via les endpoints POS dédiés.',
        );
    }
}
