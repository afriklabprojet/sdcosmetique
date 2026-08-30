<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Requests\Admin;

use App\Modules\Catalog\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $id = $category instanceof Category ? $category->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')],
            'slug' => [$required, 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', Rule::unique('categories', 'slug')->ignore($id)],
            'name' => [$required, 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:2048'],
            'banner' => ['nullable', 'string', 'max:2048'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'translations' => ['sometimes', 'array'],
            'translations.*.locale' => ['required_with:translations', 'string', 'max:10'],
            'translations.*.field' => ['required_with:translations', 'string', 'max:64'],
            'translations.*.value' => ['nullable', 'string'],
        ];
    }
}
