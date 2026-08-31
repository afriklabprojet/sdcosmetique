<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Modules\Testimonials\Http\Requests\Admin\TestimonialRequest;
use App\Modules\Testimonials\Http\Resources\Admin\TestimonialResource;
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
            Testimonial::query()->latest()->get(),
        );
    }

    public function store(TestimonialRequest $request): JsonResponse
    {
        $this->authorize('create', Testimonial::class);

        $testimonial = Testimonial::query()->create($this->payload($request));

        return TestimonialResource::make($testimonial)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        $this->authorize('view', $testimonial);

        return TestimonialResource::make($testimonial)->response();
    }

    public function update(TestimonialRequest $request, Testimonial $testimonial): JsonResponse
    {
        $this->authorize('update', $testimonial);

        $testimonial->fill($this->payload($request))->save();

        return TestimonialResource::make($testimonial->refresh())->response();
    }

    public function destroy(Testimonial $testimonial): Response
    {
        $this->authorize('delete', $testimonial);

        $testimonial->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(TestimonialRequest $request): array
    {
        $data = $request->safe()->except('approved');

        if ($request->exists('approved')) {
            $data['approved_at'] = $request->boolean('approved') ? now() : null;
        }

        return $data;
    }
}
