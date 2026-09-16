<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Requests\Admin;

use App\Modules\Pos\Enums\PosTenderMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RefundPosSaleRequest extends FormRequest
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
            'reason' => ['required', 'string', 'max:500'],
            'method' => ['required', Rule::enum(PosTenderMethod::class)],
            // Absent ou vide = rembourser tout ce qui reste sur la vente.
            'items' => ['nullable', 'array'],
            'items.*.order_item_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
