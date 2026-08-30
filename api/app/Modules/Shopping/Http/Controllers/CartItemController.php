<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Http\Requests\StoreCartItemRequest;
use App\Modules\Shopping\Http\Requests\UpdateCartItemRequest;
use App\Modules\Shopping\Models\Cart\Item;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartItemController extends ShoppingController
{
    public function store(StoreCartItemRequest $request): JsonResponse
    {
        $product = Product::query()->where('slug', $request->string('product'))->firstOrFail();
        $quantity = max(1, $request->integer('quantity', 1));

        if ($product->inventory()->effective() < $quantity) {
            return response()->json([
                'message' => 'Insufficient stock.',
            ], 422);
        }

        try {
            $this->cart($request)->add($product, $quantity);
        } catch (DomainException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return $this->cartPayload($request, $this->cart($request)->fresh(['items.product', 'coupon']), 201);
    }

    public function update(UpdateCartItemRequest $request, Item $cartItem): JsonResponse
    {
        $cart = $this->cart($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(404);
        }

        $quantity = $request->integer('quantity');

        if ($cartItem->product->inventory()->effective() < $quantity) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }

        $cartItem->forceFill(['quantity' => $quantity])->save();

        return $this->cartPayload($request, $cart->fresh(['items.product', 'coupon']));
    }

    public function destroy(Request $request, Item $cartItem): JsonResponse
    {
        $cart = $this->cart($request);

        if ($cartItem->cart_id !== $cart->id) {
            abort(404);
        }

        $cartItem->delete();

        return $this->cartPayload($request, $cart->fresh(['items.product', 'coupon']));
    }
}
