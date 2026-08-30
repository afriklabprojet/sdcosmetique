<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Http\Requests\Admin\ProductRequest;
use App\Modules\Catalog\Http\Resources\Admin\ProductResource;
use App\Modules\Catalog\Models\Product;
use App\Shared\Translations\TranslationSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->with(['category', 'files'])
            ->when(
                $request->boolean('parents_only'),
                fn ($q) => $q->whereNull('parent_id'),
            )
            ->when(
                $request->filled('q'),
                fn ($q) => $q->where('title', 'like', '%'.$request->string('q').'%'),
            )
            ->latest()
            ->paginate(min((int) $request->integer('perPage', 20), 100));

        return ProductResource::collection($products)->response();
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $product = Product::create($request->safe()->except('translations'));

        TranslationSync::apply($product, $request->validated('translations', []));

        return ProductResource::make($this->loaded($product))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Product $product): JsonResponse
    {
        $this->authorize('view', $product);

        return ProductResource::make($this->loaded($product))->response();
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $product->update($request->safe()->except('translations'));

        TranslationSync::apply($product, $request->validated('translations', []));

        return ProductResource::make($this->loaded($product))->response();
    }

    public function destroy(Product $product): Response
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }

    private function loaded(Product $product): Product
    {
        return $product->load(['category', 'children', 'badges', 'files', 'translations']);
    }
}
