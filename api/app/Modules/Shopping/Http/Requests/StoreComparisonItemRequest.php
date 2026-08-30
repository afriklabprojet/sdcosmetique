<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Requests;

use App\Modules\Shopping\Models\Comparison\Item;
use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreComparisonItemRequest extends FormRequest
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
            'product' => [
                'required',
                'string',
                'exists:products,slug',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $clientId = $this->user()?->client?->id;
                    if ($clientId === null) {
                        return;
                    }

                    $count = Item::query()->where('client_id', $clientId)->count();
                    if ($count >= 4) {
                        $fail('Comparison is limited to 4 products.');
                    }
                },
            ],
        ];
    }
}
