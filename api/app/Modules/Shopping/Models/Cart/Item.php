<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models\Cart;

use App\Modules\Catalog\Models\Product;
use App\Modules\Shopping\Models\Cart;
use Database\Factories\Shopping\CartItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('cart_items')]
#[Fillable(['cart_id', 'product_id', 'quantity'])]
class Item extends Model
{
    /** @use HasFactory<CartItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Cart, $this>
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function newFactory(): CartItemFactory
    {
        return CartItemFactory::new();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
        ];
    }
}
