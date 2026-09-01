<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

enum ProductSort: string
{
    use \ArchTech\Enums\InvokableCases;
    use \ArchTech\Enums\Names;
    use \ArchTech\Enums\Options;
    use \ArchTech\Enums\Values;

    case Featured = 'featured';
    case PriceAsc = 'price-asc';
    case PriceDesc = 'price-desc';
    case Newest = 'newest';
    case Rating = 'rating';
    case NameAsc = 'name-asc';
}
