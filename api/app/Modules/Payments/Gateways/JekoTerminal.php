<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Domain\Terminal;
use App\Modules\Payments\Models\Payment\Attempt;
use Illuminate\Support\Facades\Http;

class JekoTerminal implements Terminal
{
    public function name(): string
    {
        return 'jeko';
    }

    public function start(Attempt $attempt, Order $order): Attempt
    {
        $baseUrl = (string) config('payments.jeko.base_url', 'https://api.jeko.africa');
        $apiKey = (string) config('payments.jeko.api_key', '');
        $apiKeyId = (string) config('payments.jeko.api_key_id', '');
        $storeId = (string) config('payments.jeko.store_id', '');

        $payload = [
            'amountCents' => $attempt->amount->value,
            'currency' => $attempt->currency,
            'reference' => $attempt->reference,
            'storeId' => $storeId,
            'paymentDetails' => [
                'type' => 'redirect',
                'data' => [
                    'successUrl' => rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
                    'errorUrl' => rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
                ],
            ],
        ];

        $response = Http::withHeaders([
            'X-API-KEY' => $apiKey,
            'X-API-KEY-ID' => $apiKeyId,
        ])->asJson()->post($baseUrl.'/partner_api/payment_requests', $payload);

        $body = $response->json();
        $redirect = is_array($body) ? (string) data_get($body, 'redirectUrl', '') : '';

        $attempt->forceFill([
            'gateway' => $this->name(),
            'request_payload' => $payload,
            'redirect_url' => $redirect !== '' ? $redirect : rtrim((string) config('app.frontend_url'), '/').'/order/'.$order->reference,
            'initiated_at' => $attempt->initiated_at ?? now(),
            'failure_reason' => $response->successful() ? null : 'Jeko payment request initiation failed.',
        ])->save();

        return $attempt->refresh();
    }

    public function check(Attempt $attempt): string
    {
        $baseUrl = (string) config('payments.jeko.base_url', 'https://api.jeko.africa');
        $apiKey = (string) config('payments.jeko.api_key', '');
        $apiKeyId = (string) config('payments.jeko.api_key_id', '');

        $response = Http::withHeaders([
            'X-API-KEY' => $apiKey,
            'X-API-KEY-ID' => $apiKeyId,
        ])->get($baseUrl.'/partner_api/payment_requests/'.urlencode($attempt->reference));

        $status = strtolower((string) data_get($response->json(), 'status', ''));

        return match ($status) {
            'success', 'paid' => 'paid',
            'error', 'failed' => 'failed',
            default => 'pending',
        };
    }

    public function verify(string $body, array $headers): bool
    {
        $secret = (string) (config('payments.jeko.webhook_secret') ?: config('loyalty.webhook_secret', ''));

        if ($secret === '') {
            return app()->environment('local', 'testing');
        }

        $signature = $this->header($headers, 'jeko-signature');

        if ($signature === '') {
            return false;
        }

        return hash_equals(hash_hmac('sha256', $body, $secret), $signature);
    }

    public function parse(array $payload): string
    {
        return (string) (
            $payload['transactionDetails']['reference']
            ?? $payload['reference']
            ?? $payload['paymentRequest']['reference']
            ?? $payload['id']
            ?? ''
        );
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
