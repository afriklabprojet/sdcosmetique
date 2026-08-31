<?php

declare(strict_types=1);

namespace App\Modules\Payments\Enums;

enum PaymentMethod: string
{
    case OrangeMoney = 'orange_money';
    case Wave = 'wave';
    case MtnMomo = 'mtn_momo';
    case MoovMoney = 'moov_money';
    case Djamo = 'djamo';
    case CashOnDelivery = 'cash_on_delivery';

    public function toJeko(): string
    {
        return match ($this) {
            self::Wave => 'wave',
            self::MtnMomo => 'mtn',
            self::MoovMoney => 'moov',
            self::Djamo => 'djamo',
            self::OrangeMoney, self::CashOnDelivery => 'orange',
        };
    }
}
