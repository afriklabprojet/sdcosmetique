<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
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
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'first_name' => ['sometimes', 'nullable', 'string', 'max:128'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:64'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question' => ['required', 'string', 'max:64'],
            'answers.*.option' => ['required', 'string', 'max:64'],
        ];
    }
}
