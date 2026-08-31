<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Resources\Admin;

use App\Modules\Quiz\Models\Question;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Question
 */
class QuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['options']);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'question_type' => $this->question_type,
            'sort_order' => $this->sort_order,
            'archived' => $this->archived(),
            'options' => OptionResource::collection($this->options),
        ];
    }
}
