<?php

declare(strict_types=1);

namespace App\Modules\Loyalty\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Modules\Accounts\Models\Client;
use App\Modules\Loyalty\Domain\JekoSignature;
use App\Modules\Loyalty\Enums\LoyaltyReason;
use App\Modules\Loyalty\Models\Account;
use App\Modules\Loyalty\Models\WebhookLog;
use App\Modules\Orders\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JekoPayNotificationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $raw = $request->getContent();
        $payload = json_decode($raw, true);

        if (! is_array($payload)) {
            $payload = $request->all();
        }

        $reference = JekoSignature::reference($payload);
        $headers = $this->stringHeaders($request->headers->all());

        $log = WebhookLog::query()->firstOrCreate(
            ['reference' => $reference],
            [
                'payload' => $payload,
                'headers' => $headers,
                'status' => 'received',
            ],
        );

        if ($log->done()) {
            $log->forceFill(['updated_at' => now()])->save();

            return response()->json(['status' => 'replayed']);
        }

        $signature = $this->header($request->headers->all(), 'jeko-signature');
        $secret = (string) config('loyalty.webhook_secret');

        if ($reference === '' || ! JekoSignature::valid($raw !== '' ? $raw : json_encode($payload, JSON_THROW_ON_ERROR), $signature, $secret)) {
            $log->fail('Invalid signature.');

            return response()->json(['status' => 'rejected'], 400);
        }

        $log->forceFill(['payload' => $payload, 'headers' => $headers])->save();

        $status = strtolower((string) ($payload['status'] ?? ''));
        $accepted = in_array($status, ['success', 'paid', 'accepted'], true);

        if (! $accepted) {
            $log->record('Gateway reported failure.');

            return response()->json(['status' => 'recorded']);
        }

        $this->credit($payload, $reference);
        $log->settle();

        return response()->json(['status' => 'settled']);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function credit(array $payload, string $reference): void
    {
        $client = $this->client($payload, $reference);

        if ($client === null) {
            return;
        }

        $amount = $payload['amount']['amount'] ?? $payload['amount'] ?? 0;
        $points = intdiv((int) $amount, 1000) * 10;

        if ($points <= 0) {
            return;
        }

        $already = Account::query()
            ->where('client_id', $client->id)
            ->first()
            ?->entries()
            ->where('reason', LoyaltyReason::OrderReward)
            ->where('reference_type', 'jeko')
            ->where('reference_id', $reference)
            ->exists();

        if ($already) {
            return;
        }

        Account::for($client)->credit(
            $points,
            LoyaltyReason::OrderReward,
            'Jeko payment',
            'jeko',
            $reference,
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function client(array $payload, string $reference): ?Client
    {
        $identifier = $payload['counterpartIdentifier'] ?? null;

        if (is_string($identifier) && str_contains($identifier, '@')) {
            return User::query()->where('email', $identifier)->first()?->client;
        }

        if (is_string($identifier) && $identifier !== '') {
            $byPhone = Client::query()->where('phone', $identifier)->first();

            if ($byPhone !== null) {
                return $byPhone;
            }
        }

        return Order::query()->where('reference', $reference)->first()?->client;
    }

    /**
     * @param  array<string, mixed>  $headers
     */
    private function header(array $headers, string $name): ?string
    {
        $value = $headers[$name] ?? $headers[strtoupper($name)] ?? $headers[strtolower($name)] ?? null;

        if (is_array($value)) {
            $value = $value[0] ?? null;
        }

        return is_string($value) ? $value : null;
    }

    /**
     * @param  array<string, mixed>  $headers
     * @return array<string, string>
     */
    private function stringHeaders(array $headers): array
    {
        $flat = [];

        foreach ($headers as $key => $value) {
            $flat[(string) $key] = is_array($value) ? (string) ($value[0] ?? '') : (string) $value;
        }

        return $flat;
    }
}
