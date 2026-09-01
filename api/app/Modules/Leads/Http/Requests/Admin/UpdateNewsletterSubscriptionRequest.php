<?php

declare(strict_types=1);

namespace App\Modules\Leads\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNewsletterSubscriptionRequest extends FormRequest
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
            'unsubscribed' => ['sometimes', 'boolean'],
            'unsubscribed_at' => ['sometimes', 'nullable', 'date'],
        ];
    }
}
