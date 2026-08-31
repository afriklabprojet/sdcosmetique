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
use Illuminate\Support\Str;

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

        $attributes = $request->safe()->except(['translations', 'images']);
        if (! array_key_exists('published_at', $attributes) || $attributes['published_at'] === null) {
            $attributes['published_at'] = now();
        }

        $product = Product::create($attributes);

        TranslationSync::apply($product, $request->validated('translations', []));
        $this->syncImages($product, $request->validated('images', []));

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

        $product->update($request->safe()->except(['translations', 'images']));

        TranslationSync::apply($product, $request->validated('translations', []));
        if ($request->has('images')) {
            $this->syncImages($product, $request->validated('images', []));
        }

        return ProductResource::make($this->loaded($product))->response();
    }

    public function destroy(Product $product): Response
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->noContent();
    }

    /**
     * @param  list<string>  $images
     */
    private function syncImages(Product $product, array $images): void
    {
        $imageUrls = array_values(array_filter($images, fn ($img) => is_string($img) && trim($img) !== ''));
        $product->files()->delete();

        foreach ($imageUrls as $url) {
            $path = str_contains($url, '/storage/')
                ? (string) Str::after($url, '/storage/')
                : (string) $url;

            $product->files()->create([
                'disk' => 'public',
                'path' => $path,
                'url' => $url,
                'mime_type' => 'image/jpeg',
                'size' => 0,
            ]);
        }
    }

    private function loaded(Product $product): Product
    {
        return $product->load(['category', 'children', 'badges', 'files', 'translations']);
    }
}
