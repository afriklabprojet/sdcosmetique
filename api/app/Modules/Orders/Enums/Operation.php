<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

use ArchTech\Enums\InvokableCases;
use ArchTech\Enums\Names;
use ArchTech\Enums\Options;
use ArchTech\Enums\Values;

enum Operation: string
{
    use InvokableCases;
    use Names;
    use Options;
    use Values;

    case Add = 'add';
    case Subtract = 'subtract';
}
