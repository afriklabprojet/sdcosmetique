<?php

declare(strict_types=1);

namespace App\Modules\Payments\Enums;

enum PaymentStatus: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case Pending = 'pending';
    case Paid = 'paid';
    case Failed = 'failed';
}
