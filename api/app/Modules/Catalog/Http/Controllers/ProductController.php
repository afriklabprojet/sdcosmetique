<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Http\Requests\ProductIndexRequest;
use App\Modules\Catalog\Http\Resources\ProductResource;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Queries\ProductIndex;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(ProductIndexRequest $request, ProductIndex $query): JsonResponse
    {
        $page = $query->paginate($request);

        return ProductResource::collection($page)->response();
    }

    public function show(Product $product): JsonResponse
    {
        if ($product->parent_id !== null || ! $product->visible()) {
            abort(404);
        }

        $product->load(['category', 'children', 'badges', 'files']);

        $related = $product->related();

        return response()->json([
            'data' => new ProductResource($product),
            'related' => ProductResource::collection($related),
        ]);
    }
}
