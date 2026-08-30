<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Http\Requests\StoreWishlistItemRequest;
use App\Modules\Shopping\Models\Wishlist\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistItemController extends Controller
{
    public function store(StoreWishlistItemRequest $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        $product = Product::query()->where('slug', $request->string('product'))->firstOrFail();
        $item = Item::query()->firstOrCreate([
            'client_id' => $client->id,
            'product_id' => $product->parent_id ?? $product->id,
        ]);

        return response()->json(['data' => ['id' => $item->id]], $item->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, Item $wishlistItem): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null && $wishlistItem->client_id === $client->id, 404);
        $wishlistItem->delete();

        return response()->json([], 204);
    }
}
