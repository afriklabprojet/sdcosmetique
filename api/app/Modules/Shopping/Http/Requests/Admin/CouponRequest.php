<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Http\Requests\Admin;

use App\Modules\Shopping\Enums\CouponType;
use App\Modules\Shopping\Models\Coupon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
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
        $coupon = $this->route('coupon');
        $id = $coupon instanceof Coupon ? $coupon->id : null;
        $required = $this->isMethod('POST') ? 'required' : 'sometimes';

        return [
            'code' => [$required, 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($id)],
            'type' => [$required, Rule::enum(CouponType::class)],
            'value' => [$required, 'integer', 'min:0'],
            'threshold' => ['nullable', 'integer', 'min:0'],
            'limit' => ['nullable', 'integer', 'min:1'],
            'quota' => ['nullable', 'integer', 'min:1'],
            'starts_at' => [$required, 'date'],
            'ends_at' => [$required, 'date', 'after_or_equal:starts_at'],
        ];
    }
}
