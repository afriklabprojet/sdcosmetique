<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRedemptionRequest extends FormRequest
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
            'points_delta' => ['required', 'integer', 'max:-1'],
            'description' => ['required', 'string', 'max:255'],
            'reference_id' => ['sometimes', 'nullable', 'string', 'max:64'],
        ];
    }
}
