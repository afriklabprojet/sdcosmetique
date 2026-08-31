<?php

declare(strict_types=1);

namespace App\Modules\Testimonials\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TestimonialRequest extends FormRequest
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
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'max:128'],
            'text' => [$required, 'string', 'max:5000'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'approved' => ['sometimes', 'boolean'],
        ];
    }
}
