<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
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
            'status' => ['required', Rule::in(['shipped', 'delivered', 'cancelled'])],
            'reason' => ['required_if:status,cancelled', 'string', 'max:1000'],
        ];
    }
}
