<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Domain;

use App\Modules\Accounts\Models\Address;
use App\Modules\Accounts\Models\Client;

class Defaults
{
    public function __construct(
        public Client $client,
    ) {}

    public function shipping(): ?Address
    {
        return $this->client->shipping_id === null
            ? null
            : $this->client->addresses()->find($this->client->shipping_id);
    }

    public function billing(): ?Address
    {
        return $this->client->billing_id === null
            ? null
            : $this->client->addresses()->find($this->client->billing_id);
    }
}
