<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models\Product;

use App\Modules\Catalog\Models\Product as CatalogProduct;

/**
 * Price affordances for a catalog product (and its default child when listing a parent).
 */
final readonly class Pricing
{
    public function __construct(private CatalogProduct $product) {}

    public function unit(): int
    {
        $price = $this->product->sale_price ?? $this->product->regular_price;

        return $price?->value ?? 0;
    }

    public function display(): int
    {
        return $this->product->child()?->pricing()->unit() ?? $this->unit();
    }

    public function compare(): ?int
    {
        $target = $this->product->child() ?? $this->product;

        if ($target->sale_price !== null && $target->regular_price !== null) {
            return $target->regular_price->value;
        }

        return null;
    }
}
