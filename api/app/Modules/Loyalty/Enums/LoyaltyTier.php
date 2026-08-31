<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Enums;

enum LoyaltyTier: string
{
    case Bronze = 'bronze';
    case Argent = 'argent';
    case Or = 'or';
    case Diamant = 'diamant';
}
