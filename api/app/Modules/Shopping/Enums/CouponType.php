<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Enums;

enum CouponType: string
{
    case Percentage = 'percentage';
    case Fixed = 'fixed';
}
