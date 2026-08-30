<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Controllers\Concerns;

use App\Modules\Orders\Http\Resources\OrderResource;
use App\Modules\Orders\Models\Order;
use App\Modules\Shopping\Domain\Session;
use App\Modules\Shopping\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait HasCheckoutDraft
{
    protected function draft(Request $request): Order
    {
        $cart = Session::cart($request, mint: false);

        if ($cart->items()->doesntExist()) {
            abort(422, 'The cart is empty.');
        }

        return Order::query()->firstOrCreate(
            ['cart_id' => $cart->id],
            [
                'client_id' => $cart->client_id,
                'email' => $request->user()?->email,
                'currency' => 'XOF',
                'subtotal' => 0,
                'total' => 0,
            ],
        );
    }

    protected function payload(Request $request): JsonResponse
    {
        return (new OrderResource($this->draft($request)))->response()->setStatusCode(200);
    }
}
