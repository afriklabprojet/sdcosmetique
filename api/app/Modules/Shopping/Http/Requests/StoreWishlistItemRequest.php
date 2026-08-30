<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreWishlistItemRequest extends FormRequest
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
            'product' => ['required', 'string', 'exists:products,slug'],
        ];
    }
}
