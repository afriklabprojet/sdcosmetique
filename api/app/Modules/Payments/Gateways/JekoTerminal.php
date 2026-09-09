<?php

declare(strict_types=1);

namespace App\Modules\Payments\Gateways;

use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Domain\Terminal;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Models\Payment\Attempt;
use Illuminate\Support\Facades\Http;
use RuntimeException;

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

        $frontendUrl = rtrim((string) config('app.frontend_url', ''), '/');
        if (! $this->isPublicUrl($frontendUrl)) {
            // Jeko rejette les URLs de redirection non publiques (localhost).
            // Le repli n'est utilisé que s'il est explicitement configuré —
            // sinon on échoue bruyamment plutôt que de rediriger en silence
            // un environnement mal configuré (FRONTEND_URL absent) vers une
            // URL en dur qui pourrait être celle d'un autre environnement.
            $fallback = config('payments.jeko.redirect_fallback_url');
            if (! is_string($fallback) || ! $this->isPublicUrl($fallback)) {
                throw new RuntimeException(
                    'JekoTerminal: FRONTEND_URL n\'est pas une URL publique utilisable ("'.$frontendUrl.'") '
                    .'et JEKO_REDIRECT_FALLBACK_URL n\'est pas une URL publique valide.',
                );
            }
            $frontendUrl = rtrim($fallback, '/');
        }

        $rawMethod = request()->input('payment_method') ?? $order->payment_method;
        $method = is_string($rawMethod) ? PaymentMethod::tryFrom($rawMethod) : null;
        $jekoMethod = ($method ?? PaymentMethod::OrangeMoney)->toJeko();

        $payload = [
            'amountCents' => $attempt->amount->value * 100,
            'currency' => $attempt->currency,
            'reference' => $attempt->reference,
            'storeId' => $storeId,
            'paymentDetails' => [
                'type' => 'redirect',
                'data' => [
                    'paymentMethod' => $jekoMethod,
                    'successUrl' => $frontendUrl.'/confirmation?ref='.$order->reference,
                    'errorUrl' => $frontendUrl.'/checkout?error=payment_failed&ref='.$order->reference,
                ],
            ],
        ];

        $response = Http::withHeaders([
            'X-API-KEY' => $apiKey,
            'X-API-KEY-ID' => $apiKeyId,
        ])->asJson()->post($baseUrl.'/partner_api/payment_requests', $payload);

        $body = $response->json();
        $redirect = is_array($body) ? (string) data_get($body, 'redirectUrl', '') : '';
        $requestId = is_array($body) ? (string) data_get($body, 'id', '') : '';
        $failureReason = match (true) {
            ! $response->successful() => (string) (data_get($body, 'message') ?? 'Jeko payment request initiation failed.'),
            $redirect === '', $requestId === '' => 'Jeko returned an incomplete payment response.',
            default => null,
        };

        $attempt->forceFill([
            'gateway' => $this->name(),
            'request_payload' => [...$payload, 'jeko_request_id' => $requestId],
            'redirect_url' => $failureReason === null ? $redirect : null,
            'initiated_at' => $attempt->initiated_at ?? now(),
            'failure_reason' => $failureReason,
            'failed_at' => $failureReason === null ? null : now(),
        ])->save();

        return $attempt->refresh();
    }

    public function check(Attempt $attempt): string
    {
        $baseUrl = (string) config('payments.jeko.base_url', 'https://api.jeko.africa');
        $apiKey = (string) config('payments.jeko.api_key', '');
        $apiKeyId = (string) config('payments.jeko.api_key_id', '');
        $requestId = (string) data_get($attempt->request_payload, 'jeko_request_id', '');

        if ($requestId === '') {
            return 'pending';
        }

        $response = Http::withHeaders([
            'X-API-KEY' => $apiKey,
            'X-API-KEY-ID' => $apiKeyId,
        ])->get($baseUrl.'/partner_api/payment_requests/'.urlencode($requestId));

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

    private function isPublicUrl(string $url): bool
    {
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
        $host = trim(strtolower((string) parse_url($url, PHP_URL_HOST)), '[]');

        if (! in_array($scheme, ['http', 'https'], true) || $host === '' || $host === 'localhost') {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP) === false) {
            return true;
        }

        return filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }
}
