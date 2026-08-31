<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustmentRequest extends FormRequest
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
            'client_id' => ['required', 'integer', Rule::exists('clients', 'id')],
            'points_delta' => ['required', 'integer', 'not_in:0'],
            'description' => ['required', 'string', 'max:255'],
        ];
    }
}
