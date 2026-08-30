<?php

declare(strict_types=1);

namespace App\Modules\Orders\Enums;

enum Operation: string
{
    case Add = 'add';
    case Subtract = 'subtract';
}
