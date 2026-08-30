<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models;

use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Data\Settlement;
use App\Modules\Orders\Domain\Checkout;
use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Enums\Operation;
use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Shopping\Models\Cart;
use App\Modules\Shopping\Models\CouponRedemption;
use App\Shared\Casts\Money as MoneyCast;
use App\Shared\Money;
use Database\Factories\Orders\OrderFactory;
use DomainException;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

#[Table('orders')]
#[Fillable([
    'client_id',
    'email',
    'cart_id',
    'delivery_method_id',
    'gateway',
    'reference',
    'currency',
    'subtotal',
    'total',
    'destination',
    'note',
    'placed_at',
    'paid_at',
    'shipped_at',
    'delivered_at',
    'cancelled_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Cart, $this>
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * @return BelongsTo<Delivery\Method, $this>
     */
    public function deliveryMethod(): BelongsTo
    {
        return $this->belongsTo(Delivery\Method::class);
    }

    /**
     * @return HasMany<Order\Item, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(Order\Item::class);
    }

    /**
     * @return HasMany<Order\Adjustment, $this>
     */
    public function adjustments(): HasMany
    {
        return $this->hasMany(Order\Adjustment::class);
    }

    /**
     * @return HasOne<Delivery, $this>
     */
    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    public function repoint(Cart $survivor): void
    {
        $this->forceFill([
            'cart_id' => $survivor->id,
            'client_id' => $survivor->client_id,
        ])->save();
    }

    public function guest(): bool
    {
        return $this->client_id === null;
    }

    public function draft(): bool
    {
        return $this->placed_at === null;
    }

    public function step(): string
    {
        if ($this->placed_at !== null) {
            return 'placed';
        }

        if ($this->email === null || $this->email === '') {
            return 'contact';
        }

        if ($this->delivery_method_id === null || $this->destination === null) {
            return 'delivery';
        }

        if ($this->gateway === null || $this->gateway === '') {
            return 'payment';
        }

        return 'review';
    }

    public function status(): OrderStatus
    {
        if ($this->cancelled_at !== null) {
            return OrderStatus::Cancelled;
        }

        if ($this->delivered_at !== null) {
            return OrderStatus::Delivered;
        }

        if ($this->shipped_at !== null) {
            return OrderStatus::Shipped;
        }

        if ($this->paid_at !== null) {
            return OrderStatus::Paid;
        }

        if ($this->placed_at !== null) {
            return OrderStatus::Placed;
        }

        return OrderStatus::Draft;
    }

    public function checkout(): Checkout
    {
        return new Checkout($this);
    }

    public function place(): void
    {
        $this->checkout()->commit();
    }

    public function pay(Settlement $settlement): void
    {
        if ($this->paid_at !== null) {
            return;
        }

        if ($this->placed_at === null) {
            throw new DomainException('A draft cannot be paid.');
        }

        if ($this->cancelled_at !== null) {
            throw new DomainException('A cancelled order cannot be paid.');
        }

        if ($settlement->amount !== $this->total->value) {
            throw new DomainException('Settlement amount does not match the order total.');
        }

        $this->forceFill(['paid_at' => now()])->save();
    }

    public function ship(): void
    {
        if ($this->placed_at === null || $this->cancelled_at !== null) {
            throw new DomainException('Only placed orders can be shipped.');
        }

        $this->forceFill(['shipped_at' => now()])->save();
    }

    public function deliver(): void
    {
        if ($this->shipped_at === null) {
            throw new DomainException('Only shipped orders can be delivered.');
        }

        $this->forceFill(['delivered_at' => now()])->save();
    }

    public function cancel(string $reason): void
    {
        if ($this->cancelled_at !== null) {
            return;
        }

        if ($this->paid_at !== null) {
            throw new DomainException('A paid order cannot be cancelled without a refund path.');
        }

        DB::transaction(function () use ($reason): void {
            foreach ($this->items as $item) {
                $item->product->restore($item->quantity);
            }

            CouponRedemption::query()->where('order_id', $this->id)->delete();

            $existing = is_string($this->note) ? trim($this->note) : '';
            $note = $existing === '' ? $reason : $existing."\n".$reason;

            $this->forceFill([
                'cancelled_at' => now(),
                'note' => $note,
            ])->save();
        });
    }

    public function adjust(AdjustmentType $type, Money $amount, string $label): Order\Adjustment
    {
        if ($this->paid_at !== null) {
            throw new DomainException('Paid orders cannot be adjusted.');
        }

        return $this->adjustments()->create([
            'type' => $type,
            'operation' => $type->operation(),
            'amount' => $amount->value,
            'label' => $label,
        ]);
    }

    public function recalculate(): void
    {
        if ($this->paid_at !== null) {
            throw new DomainException('Paid orders cannot be recalculated.');
        }

        $subtotal = (int) $this->items()->sum('total');
        $added = (int) $this->adjustments()->where('operation', Operation::Add)->sum('amount');
        $subtracted = (int) $this->adjustments()->where('operation', Operation::Subtract)->sum('amount');
        $total = $subtotal + $added;

        if ($subtracted > $total) {
            throw new DomainException('Adjustments must not make the total negative.');
        }

        $this->forceFill([
            'subtotal' => $subtotal,
            'total' => $total - $subtracted,
        ])->save();
    }

    protected static function newFactory(): OrderFactory
    {
        return OrderFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subtotal' => MoneyCast::class,
            'total' => MoneyCast::class,
            'destination' => 'array',
            'placed_at' => 'datetime',
            'paid_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order): void {
            if ($order->reference === null || $order->reference === '') {
                $order->reference = strtoupper(Str::ulid()->toString());
            }
        });
    }
}
