<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        $this->authorize('viewAny', Order::class);

        $orders = $client->orders()
            ->whereNotNull('placed_at')
            ->latest('placed_at')
            ->get();

        return OrderResource::collection($orders)->response();
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        abort_unless(
            $request->user()?->administrator()
                || $request->user()?->client?->id === $order->client_id,
            404,
        );
        $this->authorize('view', $order);

        return (new OrderResource($order))->response();
    }
}
