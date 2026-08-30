<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Checkout;

use App\Http\Controllers\Controller;
use App\Modules\Accounts\Models\Address;
use App\Modules\Orders\Http\Controllers\Concerns\HasCheckoutDraft;
use App\Modules\Orders\Http\Requests\UpdateDeliveryRequest;
use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    use HasCheckoutDraft;

    public function show(Request $request): JsonResponse
    {
        $order = $this->draft($request);

        if ($order->step() === 'contact') {
            return response()->json(['message' => 'Contact is required.'], 422);
        }

        return $this->payload($request);
    }

    public function update(UpdateDeliveryRequest $request): JsonResponse
    {
        $order = $this->draft($request);

        if ($order->email === null || $order->email === '') {
            return response()->json(['message' => 'Contact is required.'], 422);
        }

        $method = Method::query()->findOrFail($request->integer('delivery_method_id'));

        if (! $method->visible()) {
            return response()->json(['message' => 'This delivery method is not available.'], 422);
        }

        $destination = $this->destination($request);

        $order->forceFill([
            'delivery_method_id' => $method->id,
            'destination' => $destination,
        ])->save();

        return $this->payload($request);
    }

    /**
     * @return array<string, mixed>
     */
    private function destination(UpdateDeliveryRequest $request): array
    {
        if ($request->filled('address_id')) {
            $address = Address::query()->findOrFail($request->integer('address_id'));
            abort_unless($request->user()?->client?->id === $address->client_id, 404);

            return $address->snapshot();
        }

        return $request->safe()->only([
            'first_name',
            'last_name',
            'company',
            'line_1',
            'line_2',
            'city',
            'postal_code',
            'country',
            'phone',
        ]);
    }
}
