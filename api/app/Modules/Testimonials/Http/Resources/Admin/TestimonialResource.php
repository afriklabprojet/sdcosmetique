<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Resources\Admin;

use App\Modules\Testimonials\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Testimonial
 */
class TestimonialResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'text' => $this->text,
            'avatar_url' => $this->avatar_url,
            'approved' => $this->approved(),
            'approved_at' => $this->approved_at,
            'created_at' => $this->created_at,
        ];
    }
}
