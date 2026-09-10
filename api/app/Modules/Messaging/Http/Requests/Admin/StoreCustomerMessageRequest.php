<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerMessageRequest extends FormRequest
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
            'subject' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'max:20000'],
        ];
    }
}
