<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDeliveryRequest extends FormRequest
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
            'delivery_method_id' => ['required', 'integer', 'exists:delivery_methods,id'],
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'first_name' => ['required_without:address_id', 'string', 'max:100'],
            'last_name' => ['required_without:address_id', 'string', 'max:100'],
            'company' => ['nullable', 'string', 'max:150'],
            'line_1' => ['required_without:address_id', 'string', 'max:255'],
            'line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required_without:address_id', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['required_without:address_id', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:32'],
        ];
    }
}
