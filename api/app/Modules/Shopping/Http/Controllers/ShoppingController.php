<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shopping\Domain\Session;
use App\Modules\Shopping\Http\Resources\CartResource;
use App\Modules\Shopping\Models\Cart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class ShoppingController extends Controller
{
    protected function cart(Request $request): Cart
    {
        return Session::cart($request, mint: true);
    }

    protected function cartPayload(Request $request, Cart $cart, int $status = 200): JsonResponse
    {
        $response = (new CartResource($cart))->response()->setStatusCode($status);

        if ($request->user()?->client === null && is_string($cart->guest_token) && $cart->guest_token !== '') {
            $response->cookie('guest_token', $cart->guest_token, 60 * 24 * 30, '/', config('session.domain'));
        }

        return $response;
    }
}
