<?php

declare(strict_types=1);

namespace App\Modules\Payments\Models\Payment;

use App\Modules\Payments\Models\Payment;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Payments\AttemptFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('payment_attempts')]
#[Fillable([
    'payment_id',
    'gateway',
    'reference',
    'amount',
    'currency',
    'redirect_url',
    'request_payload',
    'failure_reason',
    'initiated_at',
    'confirmed_at',
    'failed_at',
    'expired_at',
])]
class Attempt extends Model
{
    /** @use HasFactory<AttemptFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Payment, $this>
     */
    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    /**
     * @return HasMany<Notification, $this>
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'payment_attempt_id');
    }

    public function confirm(): void
    {
        $this->forceFill([
            'confirmed_at' => now(),
            'failed_at' => null,
        ])->save();
    }

    public function fail(string $reason): void
    {
        $this->forceFill([
            'failed_at' => now(),
            'failure_reason' => $reason,
        ])->save();
    }

    public function expire(): void
    {
        $this->forceFill(['expired_at' => now()])->save();
    }

    protected static function newFactory(): AttemptFactory
    {
        return AttemptFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => MoneyCast::class,
            'request_payload' => 'array',
            'initiated_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'failed_at' => 'datetime',
            'expired_at' => 'datetime',
        ];
    }
}
