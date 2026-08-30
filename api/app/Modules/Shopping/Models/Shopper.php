<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models;

use App\Modules\Accounts\Models\Client;

final readonly class Shopper
{
    public function __construct(
        public ?Client $client = null,
        public ?string $email = null,
    ) {}

    public function known(): bool
    {
        return $this->client !== null || ($this->email !== null && $this->email !== '');
    }
}
