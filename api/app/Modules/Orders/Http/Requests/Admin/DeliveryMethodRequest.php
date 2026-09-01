<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Requests\Admin;

use App\Modules\Orders\Models\Delivery\Method;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeliveryMethodRequest extends FormRequest
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
        $method = $this->route('deliveryMethod') ?? $this->route('delivery_method');
        $id = $method instanceof Method ? $method->id : $method;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'slug' => [$required, 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', Rule::unique('delivery_methods', 'slug')->ignore($id)],
            'name' => [$required, 'string', 'max:255'],
            'zone' => [$required, 'string', 'max:255'],
            'carrier' => [$required, 'string', 'max:100'],
            'amount' => [$required, 'integer', 'min:0'],
            'cost' => ['sometimes', 'integer', 'min:0'],
            'position' => ['sometimes', 'integer', 'min:0'],
            'visible_at' => ['nullable', 'date'],
        ];
    }
}
