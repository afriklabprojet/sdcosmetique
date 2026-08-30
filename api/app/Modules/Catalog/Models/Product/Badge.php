<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models\Product;

use App\Modules\Catalog\Models\Product;
use Database\Factories\Catalog\ProductBadgeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('product_badges')]
#[Fillable(['product_id', 'label', 'type'])]
class Badge extends Model
{
    /** @use HasFactory<ProductBadgeFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    protected static function newFactory(): ProductBadgeFactory
    {
        return ProductBadgeFactory::new();
    }
}
