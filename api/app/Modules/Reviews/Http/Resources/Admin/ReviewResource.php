<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Http\Resources\Admin;

use App\Modules\Reviews\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Review
 */
class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing('product');

        return [
            'id' => $this->id,
            'author' => $this->author_name,
            'city' => $this->author_city,
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->content,
            'skin_tone' => $this->skin_tone,
            'verified' => $this->verified(),
            'approved' => $this->approved(),
            'product_id' => $this->product_id,
            'product_slug' => $this->product?->slug,
            'created_at' => $this->created_at,
        ];
    }
}
