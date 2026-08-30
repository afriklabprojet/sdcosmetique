<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models;

use App\Modules\Shopping\Enums\CouponType;
use App\Shared\Casts\Money as MoneyCast;
use App\Shared\Money;
use Database\Factories\Shopping\CouponFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Table('coupons')]
#[Fillable(['code', 'type', 'value', 'threshold', 'limit', 'quota', 'starts_at', 'ends_at'])]
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    /**
     * @return HasMany<CouponRedemption, $this>
     */
    public function redemptions(): HasMany
    {
        return $this->hasMany(CouponRedemption::class);
    }

    public function discount(Money $total): Money
    {
        if (! $this->active() || $this->drained()) {
            return new Money(0, $total->currency);
        }

        if ($this->threshold !== null && $total->value < $this->threshold->value) {
            return new Money(0, $total->currency);
        }

        $amount = match ($this->type) {
            CouponType::Percentage => intdiv($total->value * (int) $this->value, 100),
            CouponType::Fixed => min((int) $this->value, $total->value),
        };

        return new Money($amount, $total->currency);
    }

    public function active(): bool
    {
        return Carbon::now()->between($this->starts_at, $this->ends_at);
    }

    public function drained(): bool
    {
        if ($this->limit === null) {
            return false;
        }

        return $this->redemptions()->count() >= $this->limit;
    }

    public function exhausted(Shopper $shopper): bool
    {
        if ($this->quota === null || ! $shopper->known()) {
            return false;
        }

        $uses = $this->redemptions()
            ->where(function (Builder $query) use ($shopper): void {
                if ($shopper->client !== null) {
                    $query->where('client_id', $shopper->client->id);
                }
                if ($shopper->email !== null && $shopper->email !== '') {
                    $query->orWhere('email', $shopper->email);
                }
            })
            ->count();

        return $uses >= $this->quota;
    }

    protected static function newFactory(): CouponFactory
    {
        return CouponFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'integer',
            'threshold' => MoneyCast::class,
            'limit' => 'integer',
            'quota' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }
}
