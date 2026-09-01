<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

enum AdjustmentType: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

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
