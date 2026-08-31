<?php

declare(strict_types=1);

namespace App\Modules\Payments\Domain;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;

interface Terminal
{
    public function name(): string;

    public function start(Attempt $attempt, Order $order): Attempt;

    public function check(Attempt $attempt): string;

    public function verify(string $body, array $headers): bool;

    public function parse(array $payload): string;
}
