<?php

declare(strict_types=1);

namespace App\Modules\Payments\Models;

use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Models\Order;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Shared\Casts\Money as MoneyCast;
use App\Shared\Money;
use Database\Factories\Payments\PaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('payments')]
#[Fillable(['order_id', 'amount', 'currency', 'paid_at', 'failed_at'])]
class Payment extends Model
{
    /** @use HasFactory<PaymentFactory> */
    use HasFactory;

    public static function start(Order $order, Money $amount): self
    {
        return self::query()->create([
            'order_id' => $order->id,
            'amount' => $amount->value,
            'currency' => $amount->currency,
        ]);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return HasMany<Payment\Attempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(Payment\Attempt::class);
    }

    public function confirm(): void
    {
        $this->forceFill([
            'paid_at' => now(),
            'failed_at' => null,
        ])->save();
    }

    public function fail(): void
    {
        $this->forceFill(['failed_at' => now()])->save();
    }

    public function settlement(): Settlement
    {
        $attempt = $this->attempts()
            ->whereNotNull('confirmed_at')
            ->latest('id')
            ->first();

        return new Settlement(
            gateway: $attempt?->gateway ?? 'null',
            reference: $attempt?->reference ?? $this->order->reference,
            amount: $this->amount->value,
            currency: $this->currency,
        );
    }

    public function status(): PaymentStatus
    {
        if ($this->paid_at !== null) {
            return PaymentStatus::Paid;
        }

        if ($this->failed_at !== null) {
            return PaymentStatus::Failed;
        }

        return PaymentStatus::Pending;
    }

    protected static function newFactory(): PaymentFactory
    {
        return PaymentFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => MoneyCast::class,
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }
}
