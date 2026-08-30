<?php

declare(strict_types=1);

namespace App\Modules\Shopping\Models\Wishlist;

use App\Modules\Accounts\Models\Client;
use App\Modules\Catalog\Models\Product;
use Database\Factories\Shopping\WishlistItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('wishlists')]
#[Fillable(['client_id', 'product_id'])]
class Item extends Model
{
    /** @use HasFactory<WishlistItemFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function newFactory(): WishlistItemFactory
    {
        return WishlistItemFactory::new();
    }
}
