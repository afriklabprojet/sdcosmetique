<?php

declare(strict_types=1);

namespace App\Modules\Pos\Http\Requests\Admin;

use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Pos\Enums\PosTenderMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CreatePosSaleRequest extends FormRequest
{
    /** Réseaux mobile money réellement supportés par Jeko pour un paiement — `cash_on_delivery` n'a pas de sens au comptoir. */
    private const array JEKO_NETWORKS = [
        PaymentMethod::OrangeMoney->value,
        PaymentMethod::Wave->value,
        PaymentMethod::MtnMomo->value,
        PaymentMethod::MoovMoney->value,
        PaymentMethod::Djamo->value,
    ];

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
            'cash_register_session_id' => ['required', 'integer', 'exists:cash_register_sessions,id'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'email' => ['nullable', 'email', 'max:255'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],

            'discount' => ['nullable', 'array'],
            'discount.type' => ['required_with:discount', Rule::in(['fixed', 'percent'])],
            'discount.value' => ['required_with:discount', 'integer', 'min:0'],

            'tenders' => ['required', 'array', 'min:1'],
            'tenders.*.method' => ['required', Rule::enum(PosTenderMethod::class)],
            'tenders.*.amount' => ['required', 'integer', 'min:1'],
            'tenders.*.received' => ['nullable', 'integer', 'min:1'],

            // Réseau mobile money du tender Jeko (§ paiement réel) — lu par
            // `JekoTerminal::start()` sur la requête courante, exactement
            // comme le paiement web (`StorePaymentRequest`).
            'payment_method' => [
                Rule::requiredIf(fn (): bool => $this->hasJekoTender()),
                Rule::in(self::JEKO_NETWORKS),
            ],

            'notes' => ['nullable', 'string', 'max:1000'],
            'idempotency_key' => ['required', 'string', 'max:64'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $jekoTenders = collect($this->input('tenders', []))->filter(
                fn ($tender): bool => is_array($tender) && ($tender['method'] ?? null) === PosTenderMethod::Jeko->value,
            );

            if ($jekoTenders->count() > 1) {
                $validator->errors()->add('tenders', 'Un seul règlement Jeko est autorisé par vente.');
            }
        });
    }

    private function hasJekoTender(): bool
    {
        return collect($this->input('tenders', []))->contains(
            fn ($tender): bool => is_array($tender) && ($tender['method'] ?? null) === PosTenderMethod::Jeko->value,
        );
    }
}
