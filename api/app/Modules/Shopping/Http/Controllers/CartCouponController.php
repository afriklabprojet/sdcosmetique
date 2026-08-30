<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use App\Modules\Shopping\Http\Requests\StoreCartCouponRequest;
use App\Modules\Shopping\Models\Coupon;
use App\Modules\Shopping\Models\Shopper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartCouponController extends ShoppingController
{
    public function store(StoreCartCouponRequest $request): JsonResponse
    {
        $coupon = Coupon::query()->where('code', strtoupper($request->string('code')->toString()))->first();
        $user = $request->user();
        $shopper = new Shopper($user?->client, $user?->email);

        if ($coupon === null || ! $coupon->active() || $coupon->drained() || $coupon->exhausted($shopper)) {
            return response()->json(['message' => 'This coupon is not valid.'], 422);
        }

        $cart = $this->cart($request);
        $discount = $coupon->discount($cart->subtotal());

        if ($discount->value < 1) {
            return response()->json(['message' => 'This coupon does not apply to the current cart.'], 422);
        }

        $cart->forceFill(['coupon_id' => $coupon->id])->save();

        return $this->cartPayload($request, $cart->fresh(['items.product', 'coupon']));
    }

    public function destroy(Request $request): JsonResponse
    {
        $cart = $this->cart($request);
        $cart->forceFill(['coupon_id' => null])->save();

        return $this->cartPayload($request, $cart->fresh(['items.product']));
    }
}
