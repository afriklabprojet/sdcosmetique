<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Queries;

use App\Modules\Catalog\Enums\ProductAvailability;
use App\Modules\Catalog\Enums\ProductSort;
use App\Modules\Catalog\Http\Requests\ProductIndexRequest;
use App\Modules\Catalog\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

final class ProductIndex
{
    /**
     * @return LengthAwarePaginator<int, Product>
     */
    public function paginate(ProductIndexRequest $request): LengthAwarePaginator
    {
        $perPage = (int) $request->integer('perPage', 9);
        $query = Product::query()
            ->with(['category', 'children', 'badges', 'files'])
            ->listed()
            ->priced();

        $this->applyFilters($query, $request);
        $this->applySort($query, (string) $request->input('sort', 'featured'));

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applyFilters(Builder $query, ProductIndexRequest $request): void
    {
        if ($request->filled('category')) {
            $query->whereHas('category', fn (Builder $builder): Builder => $builder->where('slug', $request->string('category')));
        }

        $availability = ProductAvailability::tryFrom((string) $request->input('availability'));

        if ($availability === ProductAvailability::InStock) {
            $query->whereHas('children', fn (Builder $builder): Builder => $builder->where('stock', '>', 0));
        }

        if ($availability === ProductAvailability::OutOfStock) {
            $query->whereDoesntHave('children', fn (Builder $builder): Builder => $builder->where('stock', '>', 0));
        }

        if ($request->filled('minPrice')) {
            $query->whereRaw(
                '(select coalesce(sale_price, regular_price, 0) from products as children where children.parent_id = products.id order by children.id limit 1) >= ?',
                [$request->integer('minPrice')],
            );
        }

        if ($request->filled('maxPrice')) {
            $query->whereRaw(
                '(select coalesce(sale_price, regular_price, 0) from products as children where children.parent_id = products.id order by children.id limit 1) <= ?',
                [$request->integer('maxPrice')],
            );
        }
        if ($request->boolean('bestseller') || $request->boolean('featured')) {
            $query->whereHas('badges', fn (Builder $builder): Builder => $builder->where('type', 'bestseller'));
        }

        if ($request->boolean('isNew')) {
            $query->where('published_at', '>=', now()->subDays(30));
        }

        if ($request->filled('q')) {
            $term = '%'.$request->string('q').'%';
            $query->where(function (Builder $builder) use ($term): void {
                $builder->where('title', 'like', $term)
                    ->orWhere('summary', 'like', $term)
                    ->orWhereHas('category', fn (Builder $category): Builder => $category->where('name', 'like', $term)->orWhere('slug', 'like', $term));
            });
        }
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applySort(Builder $query, string $sort): void
    {
        $sortOption = ProductSort::tryFrom($sort);

        match ($sortOption) {
            ProductSort::PriceAsc => $query->orderBy('display_price'),
            ProductSort::PriceDesc => $query->orderByDesc('display_price'),
            ProductSort::Newest => $query->orderByDesc('published_at'),
            ProductSort::NameAsc => $query->orderBy('title'),
            ProductSort::Rating => $query->orderByDesc('published_at'),
            default => $query
                ->orderByRaw("(select count(*) from product_badges where product_badges.product_id = products.id and product_badges.type = 'bestseller') desc")
                ->orderByRaw("(select coalesce(sum(quantity), 0) from order_items where order_items.product_id = products.id) desc")
                ->orderByDesc('published_at'),
        };
    }
}
