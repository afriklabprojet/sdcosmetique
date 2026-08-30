<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models\Order;

use App\Modules\Orders\Enums\AdjustmentType;
use App\Modules\Orders\Enums\Operation;
use App\Modules\Orders\Models\Order;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Orders\OrderAdjustmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('order_adjustments')]
#[Fillable(['order_id', 'type', 'operation', 'amount', 'label'])]
class Adjustment extends Model
{
    /** @use HasFactory<OrderAdjustmentFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected static function newFactory(): OrderAdjustmentFactory
    {
        return OrderAdjustmentFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AdjustmentType::class,
            'operation' => Operation::class,
            'amount' => MoneyCast::class,
        ];
    }
}
