<?php

declare(strict_types=1);

namespace App\Modules\Payments\Models\Payment;

use App\Jobs\SendOrderInvoiceEmailJob;
use Database\Factories\Payments\NotificationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

#[Table('payment_notifications')]
#[Fillable([
    'gateway',
    'reference',
    'payment_attempt_id',
    'payload',
    'failure_reason',
    'handled_at',
])]
class Notification extends Model
{
    /** @use HasFactory<NotificationFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Attempt, $this>
     */
    public function attempt(): BelongsTo
    {
        return $this->belongsTo(Attempt::class, 'payment_attempt_id');
    }

    public function done(): bool
    {
        return $this->handled_at !== null;
    }

    public function settle(): void
    {
        if ($this->handled_at !== null) {
            return;
        }

        $attempt = $this->attempt;

        if ($attempt === null) {
            $this->fail('No payment attempt is linked.');

            return;
        }

        DB::transaction(function () use ($attempt): void {
            $payment = $attempt->payment;
            $attempt->confirm();

            $this->forceFill([
                'handled_at' => now(),
                'failure_reason' => null,
            ])->save();

            // Paiement fractionné (caisse) : d'autres tentatives du même
            // paiement peuvent être encore en attente (ex. espèces déjà
            // confirmées, Jeko pas encore notifié) — ne régler la commande
            // que lorsque plus aucune ne l'est.
            if (! $payment->fullySettled()) {
                return;
            }

            $payment->confirm();
            $payment->order->pay($payment->settlement());
            $payment->order->linker()->attach();

            // Après le commit seulement : un job en file ne doit jamais voir
            // un paiement qui pourrait encore être annulé par un rollback.
            SendOrderInvoiceEmailJob::dispatch($payment->order->id)->afterCommit();
        });
    }

    public function fail(string $reason): void
    {
        $this->forceFill(['failure_reason' => $reason])->save();
    }

    protected static function newFactory(): NotificationFactory
    {
        return NotificationFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'handled_at' => 'datetime',
        ];
    }
}
