<?php

declare(strict_types=1);

namespace App\Modules\Pos\Models\Refund;

use App\Modules\Orders\Models\Order\Item as OrderItem;
use App\Modules\Pos\Models\Refund;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Pos\RefundItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('pos_refund_items')]
#[Fillable(['pos_refund_id', 'order_item_id', 'quantity', 'amount'])]
class Item extends Model
{
    /** @use HasFactory<RefundItemFactory> */
    use HasFactory;

    public $timestamps = false;

    /**
     * @return BelongsTo<Refund, $this>
     */
    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class, 'pos_refund_id');
    }

    /**
     * @return BelongsTo<OrderItem, $this>
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class, 'order_item_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'amount' => MoneyCast::class,
        ];
    }

    protected static function newFactory(): RefundItemFactory
    {
        return RefundItemFactory::new();
    }
}
