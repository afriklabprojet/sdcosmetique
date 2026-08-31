<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product' => ['required', 'string', Rule::exists('products', 'slug')],
            'author' => ['required', 'string', 'max:128'],
            'city' => ['sometimes', 'nullable', 'string', 'max:128'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'comment' => ['required', 'string', 'max:5000'],
            'skin_tone' => ['sometimes', 'nullable', 'string', 'max:64'],
        ];
    }
}
