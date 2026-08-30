<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Models\Payment\Attempt;
use Illuminate\Support\Facades\Http;

class CinetPayGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'cinetpay';
    }

    public function initiate(Attempt $attempt, Order $order): Attempt
    {
        $payload = [
            'apikey' => config('payments.cinetpay.api_key'),
            'site_id' => config('payments.cinetpay.site_id'),
            'transaction_id' => $attempt->reference,
            'amount' => $attempt->amount->value,
            'currency' => $attempt->currency,
            'description' => 'Order '.$order->reference,
            'notify_url' => route('webhooks.cinetpay'),
            'return_url' => rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
            'channels' => 'ALL',
            'customer_email' => $order->email,
        ];

        $response = Http::asJson()->post((string) config('payments.cinetpay.init_url'), $payload);
        $body = $response->json();
        $redirect = is_array($body) ? (string) data_get($body, 'data.payment_url', '') : '';

        $attempt->forceFill([
            'gateway' => $this->name(),
            'request_payload' => array_merge($payload, ['apikey' => '[redacted]']),
            'redirect_url' => $redirect !== '' ? $redirect : rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
            'initiated_at' => $attempt->initiated_at ?? now(),
            'failure_reason' => $response->successful() ? null : 'Gateway initiation failed.',
        ])->save();

        return $attempt->refresh();
    }

    public function inquire(Attempt $attempt): string
    {
        $response = Http::asJson()->post((string) config('payments.cinetpay.check_url'), [
            'apikey' => config('payments.cinetpay.api_key'),
            'site_id' => config('payments.cinetpay.site_id'),
            'transaction_id' => $attempt->reference,
        ]);

        $status = (string) data_get($response->json(), 'data.status', '');

        return match (strtoupper($status)) {
            'ACCEPTED', '00' => 'paid',
            'REFUSED', 'CANCELED', 'CANCELLED' => 'failed',
            default => 'pending',
        };
    }

    public function signatureValid(string $rawBody, array $headers): bool
    {
        $secret = config('payments.webhook_secret');

        if (! is_string($secret) || $secret === '') {
            return false;
        }

        $provided = $headers['x-token'] ?? $headers['X-Token'] ?? $headers['x-webhook-signature'] ?? '';

        if (is_array($provided)) {
            $provided = (string) ($provided[0] ?? '');
        }

        return hash_equals(hash_hmac('sha256', $rawBody, $secret), (string) $provided);
    }
}
