<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Enums;

enum LoyaltyTier: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case Bronze = 'bronze';
    case Argent = 'argent';
    case Or = 'or';
    case Diamant = 'diamant';
}
