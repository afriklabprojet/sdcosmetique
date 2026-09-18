<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Requests\Admin;

use App\Modules\Identity\Enums\AdminRole;
use App\Modules\Identity\Models\Admin;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class CashierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->admin?->tier() === AdminRole::SuperAdmin;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $cashier = $this->route('cashier');
        $userId = $cashier instanceof Admin ? $cashier->user_id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'password' => [
                $this->isMethod('POST') ? 'required' : 'nullable',
                'string',
                Password::default(),
                'confirmed',
            ],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
