<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Http\Requests\ProductIndexRequest;
use App\Modules\Catalog\Http\Resources\CategoryResource;
use App\Modules\Catalog\Http\Resources\ProductResource;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Queries\ProductIndex;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->withCount(['products' => fn ($query) => $query->whereNull('parent_id')->whereNotNull('published_at')])
            ->orderBy('order')
            ->get();

        return CategoryResource::collection($categories)->response();
    }

    public function show(Category $category, ProductIndexRequest $request, ProductIndex $query): JsonResponse
    {
        $request->merge(['category' => $category->slug]);
        $page = $query->paginate($request);

        return response()->json([
            'data' => (new CategoryResource($category))->additional([
                'product_count' => $page->total(),
            ]),
            'products' => ProductResource::collection($page)->resolve(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
            ],
        ]);
    }
}
