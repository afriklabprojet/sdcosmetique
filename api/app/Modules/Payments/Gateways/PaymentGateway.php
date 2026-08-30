<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;

interface PaymentGateway
{
    public function name(): string;

    public function initiate(Attempt $attempt, Order $order): Attempt;

    public function inquire(Attempt $attempt): string;

    public function signatureValid(string $rawBody, array $headers): bool;
}
