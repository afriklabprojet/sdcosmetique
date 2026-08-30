<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models\Delivery;

use App\Modules\Orders\Models\Order;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Orders\DeliveryMethodFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

#[Table('delivery_methods')]
#[Fillable(['slug', 'name', 'zone', 'carrier', 'amount', 'cost', 'position', 'visible_at'])]
class Method extends Model
{
    /** @use HasFactory<DeliveryMethodFactory> */
    use HasFactory;

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function visible(): bool
    {
        return $this->visible_at !== null && $this->visible_at->lessThanOrEqualTo(Carbon::now());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => MoneyCast::class,
            'cost' => MoneyCast::class,
            'visible_at' => 'datetime',
        ];
    }


    protected static function newFactory(): DeliveryMethodFactory
    {
        return DeliveryMethodFactory::new();
    }
}
