<?php

declare(strict_types=1);

namespace App\Modules\Content\Http\Requests\Admin;

use App\Modules\Content\Models\Banner;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BannerRequest extends FormRequest
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
        $banner = $this->route('banner');
        $id = $banner instanceof Banner ? $banner->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'key' => [$required, 'string', 'max:255', Rule::unique('banners', 'key')->ignore($id)],
            'title' => [$required, 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'image_url' => [$required, 'string', 'max:2048'],
            'link_url' => ['nullable', 'string', 'max:2048'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'visible_at' => ['nullable', 'date'],
            'metadata' => ['nullable', 'array'],
            'translations' => ['sometimes', 'array'],
            'translations.*.locale' => ['required_with:translations', 'string', 'max:10'],
            'translations.*.field' => ['required_with:translations', 'string', 'max:64'],
            'translations.*.value' => ['nullable', 'string'],
        ];
    }
}
