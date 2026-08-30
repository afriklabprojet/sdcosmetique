<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models;

use App\Modules\Accounts\Models\Client;
use App\Modules\Orders\Models\Order;
use Database\Factories\Shopping\CouponRedemptionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('coupon_redemptions')]
#[Fillable(['coupon_id', 'client_id', 'email', 'order_id'])]
class CouponRedemption extends Model
{
    /** @use HasFactory<CouponRedemptionFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected static function newFactory(): CouponRedemptionFactory
    {
        return CouponRedemptionFactory::new();
    }
}
