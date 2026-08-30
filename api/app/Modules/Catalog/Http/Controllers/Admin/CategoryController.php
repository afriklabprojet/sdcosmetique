<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Http\Requests\Admin\CategoryRequest;
use App\Modules\Catalog\Http\Resources\Admin\CategoryResource;
use App\Modules\Catalog\Models\Category;
use App\Shared\Translations\TranslationSync;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::query()
            ->withCount('products')
            ->orderBy('order')
            ->get();

        return CategoryResource::collection($categories)->response();
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $category = Category::create($request->safe()->except('translations'));

        TranslationSync::apply($category, $request->validated('translations', []));

        return CategoryResource::make($category->load('translations')->loadCount('products'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Category $category): JsonResponse
    {
        $this->authorize('view', $category);

        return CategoryResource::make($category->load('translations')->loadCount('products'))->response();
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $this->authorize('update', $category);

        $category->update($request->safe()->except('translations'));

        TranslationSync::apply($category, $request->validated('translations', []));

        return CategoryResource::make($category->load('translations')->loadCount('products'))->response();
    }

    public function destroy(Category $category): Response
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->noContent();
    }
}
