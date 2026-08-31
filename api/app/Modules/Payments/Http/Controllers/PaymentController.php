<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Domain\Terminals;
use App\Modules\Payments\Models\Payment;
use App\Shared\Money;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private readonly Terminals $terminals) {}

    public function store(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        if ($order->placed_at === null) {
            return response()->json(['message' => 'The order has not been placed.'], 422);
        }

        if ($order->paid_at !== null) {
            return response()->json(['message' => 'The order is already paid.'], 422);
        }

        if ($order->cancelled_at !== null) {
            return response()->json(['message' => 'The order is cancelled.'], 422);
        }

        $amount = new Money($order->total->value, $order->currency);
        $payment = Payment::query()->firstOrCreate(
            ['order_id' => $order->id],
            ['amount' => $amount->value, 'currency' => $amount->currency],
        );

        $gatewayName = $order->gateway ?: $this->terminals->default()->name();
        $terminal = $this->terminals->has($gatewayName)
            ? $this->terminals->get($gatewayName)
            : $this->terminals->default();

        $attempt = $payment->attempts()->create([
            'gateway' => $terminal->name(),
            'reference' => strtoupper((string) Str::ulid()),
            'amount' => $amount->value,
            'currency' => $amount->currency,
            'initiated_at' => now(),
        ]);

        $attempt = $attempt->start($terminal, $order);

        return response()->json([
            'data' => [
                'redirect_url' => $attempt->redirect_url,
                'reference' => $attempt->reference,
                'gateway' => $attempt->gateway,
            ],
        ], 201);
    }
}
