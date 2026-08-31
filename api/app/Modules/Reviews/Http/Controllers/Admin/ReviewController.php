<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Reviews\Http\Requests\Admin\ReviewRequest;
use App\Modules\Reviews\Http\Resources\Admin\ReviewResource;
use App\Modules\Reviews\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ReviewController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Review::class);

        return ReviewResource::collection(
            Review::query()->with('product')->latest()->get(),
        );
    }

    public function show(Review $review): JsonResponse
    {
        $this->authorize('view', $review);

        return ReviewResource::make($review->load('product'))->response();
    }

    public function update(ReviewRequest $request, Review $review): JsonResponse
    {
        $this->authorize('update', $review);

        $review->moderate(
            $request->exists('approved') ? $request->boolean('approved') : $review->approved(),
            $request->exists('verified') ? $request->boolean('verified') : $review->verified(),
        );

        return ReviewResource::make($review->refresh()->load('product'))->response();
    }

    public function destroy(Review $review): Response
    {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->noContent();
    }
}
