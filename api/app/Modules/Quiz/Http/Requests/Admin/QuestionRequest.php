<?php

declare(strict_types=1);

namespace App\Modules\Quiz\Http\Requests\Admin;

use App\Modules\Quiz\Enums\QuestionType;
use App\Modules\Quiz\Models\Question;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuestionRequest extends FormRequest
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
        $question = $this->route('question');
        $id = $question instanceof Question ? $question->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'slug' => [$required, 'string', 'max:64', 'regex:/^[a-z0-9_]+$/', Rule::unique('quiz_questions', 'slug')->ignore($id)],
            'title' => [$required, 'string', 'max:255'],
            'subtitle' => ['sometimes', 'nullable', 'string'],
            'question_type' => [$required, Rule::enum(QuestionType::class)],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'archived' => ['sometimes', 'boolean'],
            'options' => ['sometimes', 'array'],
            'options.*.id' => ['sometimes', 'integer', Rule::exists('quiz_options', 'id')],
            'options.*.label' => ['required_with:options', 'string', 'max:128'],
            'options.*.description' => ['sometimes', 'nullable', 'string', 'max:255'],
            'options.*.value_code' => ['required_with:options', 'string', 'max:64'],
            'options.*.glyph' => ['sometimes', 'nullable', 'string', 'max:64'],
            'options.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'options.*.archived' => ['sometimes', 'boolean'],
        ];
    }
}
