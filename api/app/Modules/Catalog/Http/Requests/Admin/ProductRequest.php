<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Requests\Admin;

use App\Modules\Catalog\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
        $product = $this->route('product');
        $id = $product instanceof Product ? $product->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'category_id' => [$required, 'integer', Rule::exists('categories', 'id')],
            'parent_id' => ['nullable', 'integer', Rule::exists('products', 'id')],
            'slug' => [$required, 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', Rule::unique('products', 'slug')->ignore($id)],
            'title' => [$required, 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'usage' => ['nullable', 'string'],
            'ingredients' => ['nullable', 'array'],
            'ingredients.*' => ['string'],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($id)],
            'label' => ['nullable', 'string', 'max:255'],
            'regular_price' => ['nullable', 'integer', 'min:0'],
            'sale_price' => ['nullable', 'integer', 'min:0'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'visible_at' => ['nullable', 'date'],
            'published_at' => ['nullable', 'date'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['string'],
            'bestseller' => ['sometimes', 'boolean'],
            'badges' => ['sometimes', 'array'],
            'badges.*' => ['string', 'max:255'],
            'skin_tones' => ['sometimes', 'array'],
            'skin_tones.*' => ['string', Rule::exists('skin_tones', 'slug')],
            'translations' => ['sometimes', 'array'],
            'translations.*.locale' => ['required_with:translations', 'string', 'max:10'],
            'translations.*.field' => ['required_with:translations', 'string', 'max:64'],
            'translations.*.value' => ['nullable', 'string'],
        ];
    }
}
