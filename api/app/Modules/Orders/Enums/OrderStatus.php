<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Names;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

enum OrderStatus: string
{
    use InvokableCases;
    use Names;
    use Options;
    use Values;

    case Draft = 'draft';
    case Placed = 'placed';
    case Paid = 'paid';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
}
