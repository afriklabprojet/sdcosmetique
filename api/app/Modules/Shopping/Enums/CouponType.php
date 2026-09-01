<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Enums;

enum CouponType: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case Percentage = 'percentage';
    case Fixed = 'fixed';
}
