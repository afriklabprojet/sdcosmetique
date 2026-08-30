<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use App\Modules\Orders\Http\Requests\UpdatePaymentMethodRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    use HasCheckoutDraft;

    public function show(Request $request): JsonResponse
    {
        $order = $this->draft($request);

        if (in_array($order->step(), ['contact', 'delivery'], true)) {
            return response()->json(['message' => 'Delivery is required.'], 422);
        }

        return $this->payload($request);
    }

    public function update(UpdatePaymentMethodRequest $request): JsonResponse
    {
        $order = $this->draft($request);

        if ($order->delivery_method_id === null || $order->destination === null) {
            return response()->json(['message' => 'Delivery is required.'], 422);
        }

        $order->forceFill(['gateway' => $request->string('gateway')->toString()])->save();

        return $this->payload($request);
    }
}
