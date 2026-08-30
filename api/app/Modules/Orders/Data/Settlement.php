<?php

declare(strict_types=1);

namespace App\Modules\Orders\Data;

final readonly class Settlement
{
    public function __construct(
        public string $gateway,
        public string $reference,
        public int $amount,
        public string $currency = 'XOF',
    ) {}
}
