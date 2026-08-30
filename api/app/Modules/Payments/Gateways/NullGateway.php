<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;

class NullGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'null';
    }

    public function initiate(Attempt $attempt, Order $order): Attempt
    {
        $attempt->forceFill([
            'gateway' => $this->name(),
            'redirect_url' => rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
            'initiated_at' => $attempt->initiated_at ?? now(),
        ])->save();

        return $attempt->refresh();
    }

    public function inquire(Attempt $attempt): string
    {
        if ($attempt->confirmed_at !== null) {
            return 'paid';
        }

        if ($attempt->failed_at !== null || $attempt->expired_at !== null) {
            return 'failed';
        }

        return 'pending';
    }

    public function signatureValid(string $rawBody, array $headers): bool
    {
        $secret = config('payments.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            return app()->environment('local', 'testing');
        }

        $provided = $this->header($headers, 'x-webhook-signature');

        return hash_equals(hash_hmac('sha256', $rawBody, $secret), $provided);
    }

    /**
     * @param  array<string, mixed>  $headers
     */
    private function header(array $headers, string $name): string
    {
        $value = $headers[$name] ?? $headers[strtoupper($name)] ?? $headers[strtolower($name)] ?? '';

        if (is_array($value)) {
            return (string) ($value[0] ?? '');
        }

        return (string) $value;
    }
}
