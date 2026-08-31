<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Testimonials\Http\Requests\StoreTestimonialRequest;
use App\Modules\Testimonials\Http\Resources\TestimonialResource;
use App\Modules\Testimonials\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TestimonialController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Testimonial::class);

        return TestimonialResource::collection(
            Testimonial::query()->whereNotNull('approved_at')->latest()->get(),
        );
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $this->authorize('create', Testimonial::class);

        $testimonial = Testimonial::query()->create([
            'name' => $request->string('name')->toString(),
            'text' => $request->string('text')->toString(),
            'avatar_url' => $request->input('avatar_url'),
        ]);

        return TestimonialResource::make($testimonial)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
