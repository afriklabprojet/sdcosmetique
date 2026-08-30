<?php

declare(strict_types=1);

namespace App\Modules\Accounts\Models;

use App\Models\User;
use App\Modules\Accounts\Domain\Defaults;
use App\Modules\Orders\Models\Order;
use App\Shared\Money;
use Database\Factories\Accounts\ClientFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('clients')]
#[Fillable(['user_id', 'phone', 'shipping_id', 'billing_id'])]
class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Address, $this>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function defaults(): Defaults
    {
        return new Defaults($this);
    }

    public function value(): Money
    {
        $amount = (int) $this->orders()
            ->whereNotNull('placed_at')
            ->whereNotNull('paid_at')
            ->sum('total');

        return new Money($amount);
    }

    protected static function newFactory(): ClientFactory
    {
        return ClientFactory::new();
    }
}
