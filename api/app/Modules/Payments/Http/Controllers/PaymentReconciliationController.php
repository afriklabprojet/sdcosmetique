<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Domain\Terminals;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Payments\Models\Payment\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentReconciliationController extends Controller
{
    public function __construct(private readonly Terminals $terminals) {}

    public function store(Request $request, Order $order): JsonResponse
    {
        $email = $request->input('email');
        $this->authorize('view', [$order, is_string($email) ? $email : null]);

        if ($order->paid_at !== null) {
            return OrderResource::make($order)->response();
        }

        $attempt = Attempt::query()
            ->whereHas('payment', fn ($query) => $query->where('order_id', $order->id))
            ->whereNull('confirmed_at')
            ->whereNull('failed_at')
            ->whereNull('expired_at')
            ->latest('id')
            ->first();

        if (! $attempt instanceof Attempt || ! $this->terminals->has($attempt->gateway)) {
            return OrderResource::make($order)->response();
        }

        $terminal = $this->terminals->get($attempt->gateway);

        if ($attempt->check($terminal) !== 'paid') {
            return OrderResource::make($order)->response();
        }

        $notification = Notification::query()->firstOrCreate(
            ['gateway' => $attempt->gateway, 'reference' => $attempt->reference],
            [
                'payment_attempt_id' => $attempt->id,
                'payload' => [
                    'transaction_id' => data_get($attempt->request_payload, 'jeko_request_id'),
                    'status' => 'PAID',
                    'checked_at' => now()->toIso8601String(),
                ],
            ],
        );

        if (! $notification->done()) {
            $notification->forceFill(['payment_attempt_id' => $attempt->id])->save();
            $notification->settle();
        }

        return OrderResource::make($order->fresh())->response();
    }
}
