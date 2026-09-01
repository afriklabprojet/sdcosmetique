<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

enum ProductAvailability: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case InStock = 'in-stock';
    case OutOfStock = 'out-of-stock';
}
