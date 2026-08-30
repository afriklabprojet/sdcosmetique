<?php

declare(strict_types=1);

namespace App\Modules\Payments\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Modules\Payments\Gateways\PaymentGateway;
use App\Modules\Payments\Models\Payment\Attempt;
use App\Modules\Payments\Models\Payment\Notification;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CinetPayNotificationController extends Controller
{
    public function __construct(private readonly PaymentGateway $gateway) {}

    public function store(Request $request): JsonResponse
    {
        $raw = $request->getContent();
        $payload = json_decode($raw, true);

        if (! is_array($payload)) {
            $payload = $request->all();
        }

        $reference = (string) ($payload['cpm_trans_id'] ?? $payload['transaction_id'] ?? $payload['reference'] ?? '');
        $gateway = $this->gateway->name();

        $notification = Notification::query()->firstOrCreate(
            ['gateway' => $gateway, 'reference' => $reference],
            ['payload' => $payload],
        );

        if ($notification->done()) {
            $notification->forceFill(['updated_at' => now()])->save();

            return response()->json(['status' => 'replayed']);
        }

        if ($reference === '' || ! $this->gateway->signatureValid($raw !== '' ? $raw : json_encode($payload, JSON_THROW_ON_ERROR), $request->headers->all())) {
            $notification->fail('Invalid signature.');

            return response()->json(['status' => 'rejected'], 400);
        }

        // Signature valid — refresh payload so a reprocess-after-fix keeps the authentic body (SEC-09).
        $notification->forceFill(['payload' => $payload])->save();

        $attempt = Attempt::query()
            ->where('reference', $reference)
            ->first();

        if ($attempt !== null) {
            $notification->forceFill(['payment_attempt_id' => $attempt->id])->save();
            $notification->refresh();
        }

        $status = strtoupper((string) ($payload['cpm_result'] ?? $payload['status'] ?? ''));
        $accepted = in_array($status, ['00', 'ACCEPTED', 'PAID'], true);

        if (! $accepted) {
            $notification->fail('Gateway reported failure.');
            $attempt?->fail('Gateway reported failure.');

            return response()->json(['status' => 'recorded']);
        }

        try {
            $notification->settle();
        } catch (DomainException $exception) {
            $notification->fail($exception->getMessage());

            return response()->json([
                'status' => 'failed',
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json(['status' => 'settled']);
    }
}
