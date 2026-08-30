<?php

declare(strict_types=1);

namespace App\Shared\Casts;

use App\Shared\Money as MoneyValue;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * @implements CastsAttributes<MoneyValue|null, MoneyValue|int|null>
 */
final class Money implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?MoneyValue
    {
        if ($value === null) {
            return null;
        }

        $currency = is_string($attributes['currency'] ?? null) ? $attributes['currency'] : 'XOF';

        return new MoneyValue((int) $value, $currency);
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?int
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof MoneyValue) {
            return $value->value;
        }

        return (int) $value;
    }
}
