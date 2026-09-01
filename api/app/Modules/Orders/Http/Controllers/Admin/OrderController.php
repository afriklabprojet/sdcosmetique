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
}
