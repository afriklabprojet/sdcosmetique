<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\Product\Pricing;

it('resolves the unit price from sale then regular', function (): void {
    $product = Product::factory()->child()->create([
        'regular_price' => 5000,
        'sale_price' => 4000,
    ]);

    $pricing = new Pricing($product);

    expect($pricing->unit())->toBe(4000)
        ->and($product->pricing()->unit())->toBe(4000);
});

it('falls back to regular price when sale is absent', function (): void {
    $product = Product::factory()->child()->create([
        'regular_price' => 5000,
        'sale_price' => null,
    ]);

    expect((new Pricing($product))->unit())->toBe(5000);
});

it('uses the child for display and compare on a parent', function (): void {
    $parent = Product::factory()->parentProduct()->create([
        'regular_price' => null,
        'sale_price' => null,
    ]);
    Product::factory()->child($parent)->create([
        'regular_price' => 8000,
        'sale_price' => 6000,
    ]);

    $pricing = $parent->pricing();

    expect($pricing->display())->toBe(6000)
        ->and($pricing->compare())->toBe(8000)
        ->and($parent->pricing()->display())->toBe(6000)
        ->and($parent->pricing()->compare())->toBe(8000);
});

it('returns null compare when there is no sale', function (): void {
    $child = Product::factory()->child()->create([
        'regular_price' => 3000,
        'sale_price' => null,
    ]);

    expect($child->pricing()->compare())->toBeNull();
});
