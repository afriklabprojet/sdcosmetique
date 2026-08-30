<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Requests\Admin;

use App\Modules\Content\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PageRequest extends FormRequest
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
        $page = $this->route('page');
        $id = $page instanceof Page ? $page->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'slug' => [$required, 'string', 'max:255', 'regex:/^[a-z0-9-]+$/', Rule::unique('pages', 'slug')->ignore($id)],
            'title' => [$required, 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'published_at' => ['nullable', 'date'],
            'translations' => ['sometimes', 'array'],
            'translations.*.locale' => ['required_with:translations', 'string', 'max:10'],
            'translations.*.field' => ['required_with:translations', 'string', 'max:64'],
            'translations.*.value' => ['nullable', 'string'],
        ];
    }
}
