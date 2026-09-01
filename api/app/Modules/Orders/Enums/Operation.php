<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

enum Operation: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case Add = 'add';
    case Subtract = 'subtract';
}
