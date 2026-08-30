<?php

declare(strict_types=1);

namespace App\Modules\Orders\Models\Order;

use App\Modules\Catalog\Models\Product;
use App\Modules\Orders\Models\Order;
use App\Shared\Casts\Money as MoneyCast;
use Database\Factories\Orders\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('order_items')]
#[Fillable(['order_id', 'product_id', 'title', 'label', 'unit_price', 'quantity', 'total'])]
class Item extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function newFactory(): OrderItemFactory
    {
        return OrderItemFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => MoneyCast::class,
            'quantity' => 'integer',
            'total' => MoneyCast::class,
        ];
    }
}
