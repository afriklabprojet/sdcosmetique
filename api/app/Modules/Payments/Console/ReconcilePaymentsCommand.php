<?php

declare(strict_types=1);

namespace App\Modules\Payments\Console;

use App\Modules\Payments\Domain\Terminals;
use App\Modules\Payments\Models\Payment\Attempt;
use Illuminate\Console\Command;

class ReconcilePaymentsCommand extends Command
{
    protected $signature = 'payments:reconcile';

    protected $description = 'Recover missing payment notifications and expire stale attempts';

    public function handle(Terminals $terminals): int
    {
        $pending = Attempt::query()
            ->whereNull('confirmed_at')
            ->whereNull('failed_at')
            ->whereNull('expired_at')
            ->where('initiated_at', '<=', now()->subMinutes(15))
            ->where('initiated_at', '>=', now()->subDay())
            ->get();

        foreach ($pending as $attempt) {
            if (! $terminals->has($attempt->gateway)) {
                continue;
            }

            $terminal = $terminals->get($attempt->gateway);
            $status = $attempt->check($terminal);

            if ($status === 'paid') {
                $notification = $attempt->notifications()->first() ?? $attempt->notifications()->create([
                    'gateway' => $attempt->gateway,
                    'reference' => $attempt->reference,
                    'payload' => [
                        'transaction_id' => $attempt->reference,
                        'status' => strtoupper($status),
                        'checked_at' => now()->toIso8601String(),
                    ],
                ]);
                $notification->settle();

                continue;
            }

            if ($status === 'failed' || $attempt->initiated_at?->lessThan(now()->subHours(2))) {
                $attempt->expire();
                $attempt->payment->fail();
                $order = $attempt->payment->order;

                if ($order->paid_at === null && $order->cancelled_at === null) {
                    $order->cancel('Payment attempt expired.');
                }
            }
        }

        return self::SUCCESS;
    }
}
