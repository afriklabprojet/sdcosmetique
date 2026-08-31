<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:128'],
            'text' => ['required', 'string', 'max:400'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
        ];
    }
}
