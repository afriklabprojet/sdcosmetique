<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends FormRequest
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
            'sort' => ['sometimes', 'string', Rule::in(['featured', 'price-asc', 'price-desc', 'newest', 'rating', 'name-asc'])],
            'q' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:255'],
            'availability' => ['sometimes', 'string', Rule::in(['in-stock', 'out-of-stock'])],
            'minPrice' => ['sometimes', 'integer', 'min:0'],
            'maxPrice' => ['sometimes', 'integer', 'min:0'],
            'featured' => ['sometimes', 'boolean'],
            'isNew' => ['sometimes', 'boolean'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'perPage' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ];
    }
}
