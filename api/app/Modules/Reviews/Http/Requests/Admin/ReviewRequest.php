<?php

declare(strict_types=1);

namespace App\Modules\Reviews\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
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
            'approved' => ['sometimes', 'boolean'],
            'verified' => ['sometimes', 'boolean'],
        ];
    }
}
