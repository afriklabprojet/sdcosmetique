<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use App\Modules\Orders\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use HasCheckoutDraft;

    public function store(Request $request): JsonResponse
    {
        $order = $this->draft($request);

        if (! $order->checkout()->ready()) {
            return response()->json(['message' => 'Checkout is incomplete.'], 422);
        }

        try {
            $order->checkout()->commit();
        } catch (DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return (new OrderResource($order->fresh(['items', 'adjustments', 'deliveryMethod'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return (new OrderResource($order))->response();
    }
}
