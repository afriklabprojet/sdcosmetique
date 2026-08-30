<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Enums\AdjustmentType;
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
            ->paginate(30);

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

        try {
            match ($request->validated('status')) {
                'shipped' => $order->ship(),
                'delivered' => $order->deliver(),
                'cancelled' => $order->cancel($request->validated('reason')),
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
