<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Resources;

use App\Modules\Catalog\Http\Resources\ProductResource;
use App\Modules\Quiz\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Submission
 */
class SubmissionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->loadMissing(['answers.question', 'answers.option']);

        return [
            'id' => $this->id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'phone' => $this->phone,
            'completed_at' => $this->completed_at,
            'answers' => $this->answers->map(fn ($answer): array => [
                'question' => $answer->question->slug,
                'option' => $answer->option->value_code,
            ])->values(),
            'recommendations' => ProductResource::collection($this->recommendations()),
        ];
    }
}
