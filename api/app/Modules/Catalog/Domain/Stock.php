<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Domain;

use App\Modules\Catalog\Models\Product;
use DomainException;

class Stock
{
    public function __construct(
        public Product $product,
    ) {}

    public function effective(): int
    {
        if ($this->product->children()->exists()) {
            return (int) $this->product->children()->sum('stock');
        }

        if ($this->product->parent_id !== null && (int) $this->product->stock === 0) {
            return (int) $this->product->parent?->stock;
        }

        return (int) $this->product->stock;
    }

    public function available(): bool
    {
        return $this->effective() > 0;
    }

    public function take(int $quantity): void
    {
        if ($quantity < 1) {
            throw new DomainException('Quantity must be at least 1.');
        }

        if ($this->decrement($quantity)) {
            return;
        }

        $this->product->refresh();

        if ($this->product->parent_id !== null && (int) $this->product->stock === 0) {
            $parent = $this->product->parent;

            if ($parent !== null && $parent->inventory()->decrement($quantity)) {
                return;
            }
        }

        throw new DomainException('Insufficient stock.');
    }

    public function restore(int $quantity): void
    {
        if ($quantity < 1) {
            throw new DomainException('Quantity must be at least 1.');
        }

        $this->product->increment('stock', $quantity);
    }

    public function decrement(int $quantity): bool
    {
        $affected = Product::query()
            ->whereKey($this->product->getKey())
            ->where('stock', '>=', $quantity)
            ->decrement('stock', $quantity);

        if ($affected > 0) {
            $this->product->refresh();

            return true;
        }

        return false;
    }
}
