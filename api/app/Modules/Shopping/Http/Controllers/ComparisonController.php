<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shopping\Models\Comparison\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComparisonController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        $items = Item::query()
            ->with('product.files')
            ->where('client_id', $client->id)
            ->get()
            ->map(fn (Item $item): array => [
                'id' => $item->id,
                'slug' => $item->product->slug,
                'title' => $item->product->title,
                'images' => $item->product->files->pluck('url')->values(),
            ]);

        return response()->json(['data' => $items]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $client = $request->user()?->client;
        abort_unless($client !== null, 403);

        Item::query()->where('client_id', $client->id)->delete();

        return response()->json([], 204);
    }
}
