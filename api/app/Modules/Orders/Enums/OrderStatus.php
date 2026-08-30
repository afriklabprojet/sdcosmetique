<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Placed = 'placed';
    case Paid = 'paid';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
}
