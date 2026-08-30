<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models;

use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Orders\DeliveryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('deliveries')]
#[Fillable(['order_id', 'carrier', 'tracking_number', 'cost', 'shipped_at', 'delivered_at'])]
class Delivery extends Model
{
    /** @use HasFactory<DeliveryFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function ship(string $trackingNumber): void
    {
        $this->forceFill([
            'tracking_number' => $trackingNumber,
            'shipped_at' => now(),
        ])->save();

        $this->order->forceFill(['shipped_at' => now()])->save();
    }

    public function deliver(): void
    {
        $this->forceFill(['delivered_at' => now()])->save();
        $this->order->forceFill(['delivered_at' => now()])->save();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cost' => MoneyCast::class,
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }


    protected static function newFactory(): DeliveryFactory
    {
        return DeliveryFactory::new();
    }
}
