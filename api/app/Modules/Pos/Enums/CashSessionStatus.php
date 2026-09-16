<?php

declare(strict_types=1);

namespace App\Modules\Pos\Enums;

use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Names;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

enum CashSessionStatus: string
{
    use InvokableCases;
    use Names;
    use Options;
    use Values;

    case Open = 'open';
    case Closed = 'closed';
}
