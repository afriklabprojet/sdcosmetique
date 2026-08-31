<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Testimonials\Http\Resources\TestimonialResource;
use App\Modules\Testimonials\Models\Testimonial;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Testimonial::class);

        return TestimonialResource::collection(
            Testimonial::query()->whereNotNull('approved_at')->latest()->get(),
        );
    }
}
