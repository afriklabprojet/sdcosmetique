<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Catalog\Models\Product;
use App\Modules\Reviews\Http\Requests\StoreReviewRequest;
use App\Modules\Reviews\Http\Resources\ReviewResource;
use App\Modules\Reviews\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Review::class);

        $query = Review::query()->whereNotNull('approved_at')->with('product')->latest();

        if ($request->filled('product')) {
            $query->whereHas('product', fn ($builder) => $builder->where('slug', $request->string('product')));
        }

        return ReviewResource::collection($query->get());
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $this->authorize('create', Review::class);

        $product = Product::query()->where('slug', $request->string('product'))->firstOrFail();

        $review = Review::query()->create([
            'product_id' => $product->id,
            'author_name' => $request->string('author')->toString(),
            'author_city' => $request->input('city'),
            'rating' => $request->integer('rating'),
            'title' => $request->input('title'),
            'content' => $request->string('comment')->toString(),
            'skin_tone' => $request->input('skin_tone'),
        ]);

        return ReviewResource::make($review->load('product'))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
