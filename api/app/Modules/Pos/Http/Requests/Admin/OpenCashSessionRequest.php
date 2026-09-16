<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OpenCashSessionRequest extends FormRequest
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
            'cash_register_id' => ['required', 'integer', 'exists:cash_registers,id'],
            'opening_balance' => ['required', 'integer', 'min:0'],
        ];
    }
}
