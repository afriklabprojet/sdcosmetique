<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

enum AdjustmentType: string
{
    case Shipping = 'shipping';
    case Discount = 'discount';
    case ShippingDiscount = 'shipping_discount';

    public function operation(): Operation
    {
        return match ($this) {
            self::Shipping => Operation::Add,
            self::Discount, self::ShippingDiscount => Operation::Subtract,
        };
    }
}
