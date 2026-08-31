<?php

declare(strict_types=1);

namespace App\Modules\Settings\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest
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
            'value' => ['required'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }
}
