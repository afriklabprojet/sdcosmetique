<?php

declare(strict_types=1);

namespace App\Modules\Orders\Http\Requests\Admin;

use App\Modules\Orders\Enums\AdjustmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdjustmentRequest extends FormRequest
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
            'type' => ['required', Rule::enum(AdjustmentType::class)],
            'amount' => ['required', 'integer', 'min:0'],
            'label' => ['required', 'string', 'max:255'],
        ];
    }
}
